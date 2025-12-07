import { roomSessionRepository } from "../repos/roomSessionRepository";
import {
  RoomSessionSettingJsonContents,
  TCommand,
  TCommandHistory,
  TDirection,
  TRoomSession,
} from "../domain/types";
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
import logger from "../util/logger";
import { lineUtil } from "../util/lineUtil";
import { v4 as uuidv4 } from "uuid";
import {
  GAME_RESULT_MAP,
  GAME_STATUS,
  ROLE_GROUP_MAP,
  ROLE_NAME_MAP,
  ROOM_MEMBER_STATUS,
} from "../domain/common";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { roomService } from "./roomService";
import { roomRepository } from "../repos/roomRepository";

const MAX_TURN = 5;
function isGoalReached(
  tempLocation: { posX: number; posY: number; direction: TDirection },
  settingContents: RoomSessionSettingJsonContents
): boolean {
  return settingContents.goalCell.some(
    (goalCell) =>
      tempLocation.posX === goalCell[0] && tempLocation.posY === goalCell[1]
  );
}

function isSpecialCellsReached(
  tempLocation: { posX: number; posY: number; direction: TDirection },
  settingContents: RoomSessionSettingJsonContents
): boolean {
  return settingContents.specialCells.some(
    (specialCell) =>
      tempLocation.posX === specialCell[0] &&
      tempLocation.posY === specialCell[1]
  );
}
export const roomSessionService = {
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
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let isGoalReachedFlg = false;
      const currentRoomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!currentRoomSession) {
        throw new NotFoundError("Room session not found");
      }
      gameUtil.roomSessionChecker(currentRoomSession);
      // BLOCKされているメンバーのblockを解除
      const blockedMembers = currentRoomSession.room.members.filter(
        (member) => member.status === ROOM_MEMBER_STATUS.BLOCKED
      );
      for (const member of blockedMembers) {
        await roomMemberRepository.updateRoomMemberStatus(
          tx,
          currentRoomSession.roomId,
          member.userId,
          ROOM_MEMBER_STATUS.ACTIVE
        );
      }
      let { posX, posY, direction, turn, setting } = currentRoomSession;
      let tempLocation = { posX, posY, direction };
      const settingContents = gameUtil.getRoomSettingJsonContents(setting);

      // 今回実行されるコマンド
      const targetCommands = currentRoomSession.commands.filter(
        (command) => !command.processed
      );
      // 特殊コマンドと通常コマンドを取得する
      const specialCommands = targetCommands.filter(
        (command) => command.commandType === "SPECIAL"
      );
      const normalCommands = targetCommands.filter(
        (command) => command.commandType !== "SPECIAL"
      );

      // TODO COMMANDの実行順序の確認
      // TODO HIEROPHANTの阻害の対象者を取得する

      // 特殊コマンドを実行する
      logger.info("特殊コマンドの実行");

      // 特殊コマンドを実行する優先順位
      const specialCommandOrder = currentRoomSession.room.members
        .sort((a, b) => b.role?.priority! - a.role?.priority!)
        .map((member) => member.id);

      const sortedSpecialCommands = specialCommands.sort(
        (a, b) =>
          specialCommandOrder.indexOf(a.memberId) -
          specialCommandOrder.indexOf(b.memberId)
      );
      for (const command of sortedSpecialCommands) {
        logger.info(`特殊コマンドの実行: ${command.memberId}`);
        await gameUtil.executeSpecialCommand(
          command,
          {
            location: tempLocation,
            goalCell: settingContents.goalCell,
            maxX: settingContents.size,
            maxY: settingContents.size,
          },
          tx,
          toTRoomSessionFromRoomSessionWithMembers(currentRoomSession)
        );
        // コマンドを実行済みにする
        await commandRepository.updateCommand(tx, command.id, true);
        await roomMemberRepository.updateRoomMemberStatus(
          tx,
          currentRoomSession.roomId,
          currentRoomSession.room.members.find(
            (member) => member.id === command.memberId
          )?.userId!,
          ROOM_MEMBER_STATUS.SKILL_USED
        );
      }
      logger.info("通常コマンドの実行");
      // 通常コマンドを実行する優先順位
      const normalCommandOrder = currentRoomSession.room.members
        .sort((a, b) => a.sort - b.sort)
        .map((member) => member.id);

      const sortedNormalCommands = normalCommands.sort(
        (a, b) =>
          normalCommandOrder.indexOf(a.memberId) -
          normalCommandOrder.indexOf(b.memberId)
      );
      for (const command of sortedNormalCommands) {
        logger.info(`通常コマンドの実行: ${command.memberId}`);
        // コマンドを実行する
        tempLocation = gameUtil.executeCommand(
          command,
          {
            location: tempLocation,
            goalCell: settingContents.goalCell,
            maxX: settingContents.size,
            maxY: settingContents.size,
          },
          toTRoomSessionFromRoomSessionWithMembers(currentRoomSession)
        );
        // コマンドを実行済みにする
        await commandRepository.updateCommand(tx, command.id, true);
        await commandRepository.createCommandHistory(
          tx,
          roomSessionId,
          command.memberId,
          command.id,
          turn,
          command.arg
        );
        if (isGoalReached(tempLocation, settingContents)) {
          // ゴールに到達した場合はゲームを終了する
          await roomSessionRepository.updateRoomSession(
            tx,
            roomSessionId,
            tempLocation.posX,
            tempLocation.posY,
            turn,
            tempLocation.direction,
            GAME_STATUS.COMPLETED_GOAL
          );
          for (const member of currentRoomSession.room.members) {
            await lineUtil.sendSimpleTextMessage(
              member.userId,
              `ROOM[${currentRoomSession.room.roomCode}] TURN[${turn}] GOAL`
            );
          }
          isGoalReachedFlg = true;
          break;
        }
      }
      // 全てのコマンド完了後
      if (!isGoalReachedFlg) {
        if (turn >= MAX_TURN) {
          // ゲームを終了する
          for (const member of currentRoomSession.room.members) {
            await lineUtil.sendSimpleTextMessage(
              member.userId,
              `ROOM[${currentRoomSession.room.roomCode}] 全てのturnが終了しましたが、ゴールに到達していませんでした。`
            );
          }
          await roomSessionRepository.updateRoomSession(
            tx,
            roomSessionId,
            tempLocation.posX,
            tempLocation.posY,
            turn,
            tempLocation.direction,
            GAME_STATUS.COMPLETED_NOT_GOAL
          );
        } else {
          // 次のturnを開始できる
          let specialCellMessage = "";
          if (isSpecialCellsReached(tempLocation, settingContents)) {
            const randomKingdomMember = gameUtil.getRandomKingdomMember(
              currentRoomSession.room.members
            );
            if (randomKingdomMember) {
              specialCellMessage = `\n${randomKingdomMember.role?.roleName}は${randomKingdomMember.user?.displayName}です`;
            }
          }
          // FOOLの効果を取り消す
          await roomSessionRepository.updateRoomSession(
            tx,
            roomSessionId,
            tempLocation.posX,
            tempLocation.posY,
            turn,
            tempLocation.direction,
            GAME_STATUS.IN_PROGRESS
          );
          for (const member of currentRoomSession.room.members) {
            await lineUtil.sendSimpleTextMessage(
              member.userId,
              `ROOM[${currentRoomSession.room.roomCode}] TURN[${turn}] COMPLETED \n なんちゃらかんちゃら${specialCellMessage}`
            );
          }
        }
      }

      const updatedRoomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!updatedRoomSession) {
        throw new NotFoundError("Room session not found");
      }
      return toTRoomSessionFromRoomSessionWithUsers(
        updatedRoomSession,
        currentRoomSession.room,
        targetCommands
      );
    });
  },

  // コマンドの受理
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

      if (!roomSession.room.openFlg) {
        throw new BadRequestError("Room is not Open");
      }

      // 同じFormからの連続した命令の実行は無効にする
      const isInvalidated = await invalidateLineUserFormRepo.checkIsInvalidated(
        tx,
        formId
      );
      if (isInvalidated) {
        logger.error("同じFORMID");
        return {
          isValid: false,
          roomSessionId: roomSessionId,
          commandsCount: 0,
        };
      }
      // turnが一致しない場合は無効にする
      if (turn !== roomSession.turn) {
        logger.error(`turnが一致しない ${turn} is not roomSession.turn`);
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
          command.commandType,
          command.arg
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
  startNextTurn: async (roomSessionId: number): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      const nextTurn = roomSession.turn + 1;
      await roomSessionRepository.stepNextTurn(tx, roomSessionId, nextTurn);

      const formId = uuidv4();
      for (const member of roomSession.room.members) {
        const role = member.role;
        const user = member.user;
        const availableCommands = await getAvailableCommandsByRole(
          role,
          "turn_action",
          {
            formId,
            roomSessionId: roomSessionId,
            memberId: member.id,
            turn: nextTurn,
          },
          roomSession.room.members,
          member
        );

        await lineUtil.sendAvailableCommandsMessage(
          user.userId,
          availableCommands
        );
      }
    });
  },
  getCommandHistory: async (
    roomSessionId: number
  ): Promise<TCommandHistory[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const commandHistory = await commandRepository.getCommandHistory(
        tx,
        roomSessionId
      );

      return commandHistory.map((commandHistory) => {
        return {
          ...commandHistory,
          command: commandHistory.command,
        };
      });
    });
  },
  gameComplete: async (
    roomSessionId: number,
    result: number
  ): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await roomSessionRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }

      for (const member of roomSession.room.members) {
        let message = "";
        switch (result) {
          case GAME_RESULT_MAP.KINGDOM_WIN:
            if (member.role?.group === ROLE_GROUP_MAP.KINGDOM) {
              message = "おめでとうございます！";
            } else {
              message = "ざんねんでした";
            }
            message += "\nキングダムの勝利です";
            break;
          case GAME_RESULT_MAP.HELL_WIN:
            if (member.role?.group === ROLE_GROUP_MAP.HELL) {
              message = "おめでとうございます！";
            } else {
              message = "ざんねんでした";
            }
            message += "\nヘルの勝利です";
            break;
          case GAME_RESULT_MAP.TOWER_WIN:
            if (member.role?.group === ROLE_GROUP_MAP.TOWER) {
              message = "おめでとうございます！";
            } else {
              message = "ざんねんでした";
            }
            message += "\n塔の勝利です";
            break;
        }
        await lineUtil.sendSimpleTextMessage(
          member.userId,
          `ROOM[${roomSession.room.roomCode}] ${message}`
        );
      }

      await roomRepository.updateRoom(tx, roomSession.room.id, {
        openFlg: false,
      });
    });
  },

  // createRoomSession: async (roomId: number): Promise<TRoomSession> => {
  //   return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
  //     const existingRoomSession =
  //       await roomSessionRepository.getRoomSessionByRoomId(tx, roomId);
  //     if (existingRoomSession) {
  //       throw new BadRequestError("Room session already exists");
  //     }
  //     // 初期設定
  //     const setting = gameUtil.createGameSetting();

  //     await roomSessionRepository.createRoomSession(
  //       tx,
  //       roomId,
  //       setting.initialCell[0],
  //       setting.initialCell[1],
  //       setting.initialDirection,
  //       JSON.stringify(setting)
  //     );

  //     // roomSessionのsetting fileを作成する

  //     const roomSession = await roomSessionRepository.getRoomSessionByRoomId(
  //       tx,
  //       roomId
  //     );

  //     if (!roomSession) {
  //       throw new NotFoundError("Room session 作成失敗");
  //     }
  //     return toTRoomSessionFromRoomSessionWithMembers(roomSession);
  //   });
  // },
};
