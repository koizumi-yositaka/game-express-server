import { roomSessionRepository } from "../repos/roomSessionRepository";
import { TCommand, TRoomSession } from "../domain/types";
import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../error/AppError";
import { commandRepository } from "../repos/commandRepository";
import {
  toTRoomSessionFromRoomSessionWithMembers,
  toTRoomSessionFromRoomSessionWithUsers,
} from "../domain/typeParse";
import { gameUtil, getAvailableCommandsByRole } from "../util/gameUtil";
import { AddCommandResult } from "../controllers/dto";
import { invalidateLineUserFormRepo } from "../repos/invalidateLineUserFormRepo";
import { lineUtil } from "../util/lineUtil";
import { v4 as uuidv4 } from "uuid";
export const roomSessionService = {
  createRoomSession: async (roomId: number): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingRoomSession =
        await roomSessionRepository.getRoomSessionByRoomId(tx, roomId);
      if (existingRoomSession) {
        throw new BadRequestError("Room session already exists");
      }
      const posX = 3;
      const posY = 3;
      const direction = "N";
      await roomSessionRepository.createRoomSession(
        tx,
        roomId,
        posX,
        posY,
        direction,
        "setting"
      );

      const roomSession = await roomSessionRepository.getRoomSessionByRoomId(
        tx,
        roomId
      );

      if (!roomSession) {
        throw new NotFoundError("Room session 作成失敗");
      }
      return toTRoomSessionFromRoomSessionWithMembers(roomSession);
    });
  },
  getRoomSession: async (
    roomSessionId: number,
    processed?: boolean
  ): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      if (processed !== undefined) {
        roomSession.commands = roomSession.commands.filter(
          (command) => command.processed === processed
        );
      } else {
        roomSession.commands = [];
      }

      return toTRoomSessionFromRoomSessionWithMembers(roomSession);
    });
  },
  getRoomSessionByRoomId: async (
    roomId: number,
    processed?: boolean
  ): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSessionByRoomId(
        tx,
        roomId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      if (processed !== undefined) {
        roomSession.commands = roomSession.commands.filter(
          (command) => command.processed === processed
        );
      } else {
        roomSession.commands = [];
      }
      return toTRoomSessionFromRoomSessionWithMembers(roomSession);
    });
  },
  reflectCommands: async (roomSessionId: number): Promise<TRoomSession> => {
    const maxX = 7;
    const maxY = 7;
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const currentRoomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!currentRoomSession) {
        throw new NotFoundError("Room session not found");
      }
      let { posX, posY, direction, turn } = currentRoomSession;
      let tempLocation = { posX, posY, direction };
      const commands = currentRoomSession.commands.filter(
        (command) => !command.processed
      );
      console.log(`commands: ${commands.length}`);
      for (const command of commands) {
        // コマンドを実行する
        tempLocation = gameUtil.executeCommand(
          command,
          tempLocation,
          maxX,
          maxY
        );
        await commandRepository.updateCommand(tx, command.id, true);
        await commandRepository.createCommandHistory(
          tx,
          roomSessionId,
          command.memberId,
          command.id,
          turn
        );
      }
      const updatedRoomSession = await roomSessionRepository.updateRoomSession(
        tx,
        roomSessionId,
        tempLocation.posX,
        tempLocation.posY,
        turn + 1,
        tempLocation.direction
      );
      return toTRoomSessionFromRoomSessionWithUsers(
        updatedRoomSession,
        currentRoomSession.room,
        commands
      );
    });
  },

  addCommands: async (
    roomSessionId: number,
    turn: number,
    formId: string,
    commands: TCommand[]
  ): Promise<AddCommandResult> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }

      // 同じFormからの連続した命令の実行は無効にする
      const isInvalidated = await invalidateLineUserFormRepo.checkIsInvalidated(
        tx,
        formId
      );
      if (isInvalidated) {
        return {
          isValid: false,
          roomSessionId: roomSessionId,
          commandsCount: 0,
        };
      }
      console.log(roomSession.commands);
      // turnが一致しない場合は無効にする
      if (turn !== roomSession.turn) {
        return {
          isValid: false,
          roomSessionId: roomSessionId,
          commandsCount: 0,
        };
      }
      for (const command of commands) {
        await commandRepository.createCommand(
          tx,
          roomSessionId,
          command.memberId,
          command.commandType
        );
      }
      // formの無効化
      await invalidateLineUserFormRepo.invalidateLineUserForm(tx, formId);
      return {
        isValid: true,
        roomSessionId: roomSessionId,
        commandsCount: commands.length,
      };
    });
  },
  sendAvailableCommandsMessage: async (
    roomSessionId: number
  ): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      const formId = uuidv4();
      roomSession.room.members.forEach(async (member) => {
        const role = member.role;
        const user = member.user;
        const availableCommands = await getAvailableCommandsByRole(
          role,
          "turn_action",
          {
            formId,
            roomSessionId: roomSessionId,
            memberId: member.id,
            turn: roomSession.turn,
          }
        );
        lineUtil.sendAvailableCommandsMessage(user.userId, availableCommands);
      });
    });
  },
};
