import { roomSessionRepository } from "../repos/roomSessionRepository";
import { TCommand, TDirection, TRoomSession } from "../domain/types";
import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";
import { BadRequestError, NotFoundError } from "../error/AppError";
import { commandRepository } from "../repos/commandRepository";
import {
  toTRoomSessionFromRoomSessionWithMembers,
  toTRoomSessionFromRoomSessionWithUsers,
} from "../domain/typeParse";

type Location = {
  posX: number;
  posY: number;
  direction: TDirection;
};

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
  getRoomSession: async (roomSessionId: number): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      return toTRoomSessionFromRoomSessionWithMembers(roomSession);
    });
  },
  getRoomSessionByRoomId: async (roomId: number): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSessionByRoomId(
        tx,
        roomId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      return toTRoomSessionFromRoomSessionWithMembers(roomSession);
    });
  },
  reflectCommands: async (roomSessionId: number): Promise<TRoomSession> => {
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
      const commands = await commandRepository.getCommands(tx, roomSessionId);
      console.log(`commands: ${commands.length}`);
      for (const command of commands) {
        // コマンドを実行する
        tempLocation = executeCommand(command, tempLocation);
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
        currentRoomSession.room
      );
    });
  },
  addCommands: async (roomSessionId: number, commands: TCommand[]) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      for (const command of commands) {
        await commandRepository.createCommand(
          tx,
          roomSessionId,
          command.memberId,
          command.commandType
        );
      }
      return {
        roomSessionId: roomSessionId,
        commandsCount: commands.length,
      };
    });
  },
};

function executeCommand(command: TCommand, location: Location): Location {
  const { commandType } = command;
  let { posX, posY, direction } = location;

  if (commandType.startsWith("TURN_")) {
    switch (commandType) {
      case "TURN_RIGHT":
        direction =
          direction === "N"
            ? "E"
            : direction === "E"
            ? "S"
            : direction === "S"
            ? "W"
            : "N";
        break;
      default:
        direction = "N";
    }
  } else {
    switch (commandType) {
      case "FORWARD":
        switch (direction) {
          case "N":
            posY += 1;
            break;
          case "E":
            posX += 1;
            break;
          case "S":
            posY -= 1;
            break;
          case "W":
            posX -= 1;
            break;
        }
        break;
      default:
        break;
    }
  }
  console.log("実行前", location);
  console.log("実行後", { posX, posY, direction });
  return {
    posX,
    posY,
    direction,
  };
}
