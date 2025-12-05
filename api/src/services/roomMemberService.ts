import { prisma } from "../db/prisma";
import { Prisma, RoomMember } from "../generated/prisma/client";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { roomRepository } from "../repos/roomRepository";
import { userRepository } from "../repos/userRepository";
import { gameUtil } from "../util/gameUtil";
import {
  toTRoom,
  toTRoomMember,
  toTRoomMemberFromRoomMemberWithUsers,
  toTUser,
  toTRole,
} from "../domain/typeParse";

import { TRoom } from "../domain/types";

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";
import { TRoomMember, TRoomSession } from "../domain/types";
import { GAME_STATUS, ROLE_NAME_MAP } from "../domain/common";
import { lineUtil } from "../util/lineUtil";
import { roleMasterService } from "./roleMasterService";
import { RoomWithUsers } from "../repos/roomRepository";
import { roomSessionRepository } from "../repos/roomSessionRepository";
import { toTRoomSessionFromRoomSessionWithMembers } from "../domain/typeParse";
import { roleSpecialMoveExecutor } from "../roles/roleSpecialMoveExecutor";

export const roomMemberService = {
  joinRoom: async (roomCode: string, userId: string): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (room.status !== GAME_STATUS.NOT_STARTED) {
        throw new BadRequestError("Roomは募集中ではありません");
      }
      const memberInfo = await userRepository.getUser(tx, userId);
      if (!memberInfo) {
        throw new NotFoundError("ユーザーが見つかりません");
      }
      const roomMembers = await roomMemberRepository.getRoomMembers(
        tx,
        room.id
      );
      if (!roomMembers.some((member) => member.userId === userId)) {
        await roomMemberRepository.joinRoom(tx, room.id, userId);
      }
      // あらたしくメンバー状況を取得するかは未定
      return toTRoom(room, []);
    });
  },
  getRoomMembers: async (roomCode: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const roomWithUsers: RoomWithUsers | null =
        await roomRepository.findWithUsersById(tx, room.id);
      if (!roomWithUsers) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return roomWithUsers.members.map((member) =>
        toTRoomMemberFromRoomMemberWithUsers(member)
      );
    });
  },
  getRoomMember: async (roomCode: string, userId: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomMember =
        await roomMemberRepository.getRoomMemberByRoomCodeAndUserId(
          tx,
          roomCode,
          userId
        );
      if (!roomMember) {
        throw new NotFoundError("メンバーが見つかりません");
      }
      return roomMember.user
        ? {
            ...toTRoomMember(roomMember),
            user: toTUser(roomMember.user),
            role: toTRole(roomMember.role),
          }
        : toTRoomMember(roomMember);
    });
  },
  startGame: async (roomCode: string): Promise<TRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room || !room.id) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const existingRoomSession =
        await roomSessionRepository.getRoomSessionByRoomId(tx, room.id);
      if (existingRoomSession) {
        throw new BadRequestError("Room session already exists");
      }
      const roomMembers = await roomMemberRepository.getRoomMembers(
        tx,
        room.id
      );

      gameUtil.shuffleArray(roomMembers).forEach(async (member, index) => {
        await roomMemberRepository.updateRoomMemberSort(
          tx,
          room.id,
          member.userId,
          index
        );
      });

      // 役割を割り当てる
      const assignedRoles = await assignRoles(roomMembers);

      assignedRoles.forEach(async (member) => {
        await roomMemberRepository.updateRoomMemberRole(
          tx,
          room!.id,
          member.userId,
          member.roleId
        );
      });
      await roomRepository.updateRoom(tx, room.id, {
        status: GAME_STATUS.IN_PROGRESS,
      });
      // if (roomMembers.length < 2) {
      //   throw new BadRequestError("部屋に参加者が2人未満です");
      // }
      assignedRoles.forEach(async (member) => {
        const { success } = await lineUtil.sendNoticeRoleMessage(
          member.userId,
          member.role?.roleName ?? "",
          member.role?.description ?? "",
          member.role?.imageUrl ?? "",
          member.role?.notionUrl ?? "",
          "役割を確認"
        );
        if (!success) {
          console.error(
            `Failed to send notice role message to ${member.userId}`
          );
          throw new InternalServerError("Failed to send notice role message");
        }
      });

      // 3秒待つ
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // 初期設定
      const initailSetting = gameUtil.createGameSetting();
      await roomSessionRepository.createRoomSession(
        tx,
        room.id,
        initailSetting.initialCell[0],
        initailSetting.initialCell[1],
        initailSetting.initialDirection,
        JSON.stringify(initailSetting)
      );

      const roomSession = await roomSessionRepository.getRoomSessionByRoomId(
        tx,
        room.id
      );
      if (!roomSession) {
        throw new NotFoundError("Room session 作成失敗");
      }

      roomSession.room.members.forEach((member) => {
        if (member?.role?.roleName) {
          roleSpecialMoveExecutor.executeInitialize(
            member?.role?.roleName as keyof typeof ROLE_NAME_MAP,
            member,
            roomSession
          );
        } else {
          throw new InternalServerError("Role name is required");
        }
      });
      return toTRoomSessionFromRoomSessionWithMembers(roomSession);

      // room = await roomRepository.getRoomById(tx, room.id);
      // if (!room) {
      //   throw new NotFoundError("部屋が見つかりません");
      // }
      // return toTRoomFromRoomWithUsers(room);
    });
  },
};

async function assignRoles(roomMembers: TRoomMember[]): Promise<TRoomMember[]> {
  const roles = await roleMasterService.getRoles();
  return gameUtil.assignRoles(roomMembers, roles);
}
