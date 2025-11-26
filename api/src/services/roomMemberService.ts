import { prisma } from "../db/prisma";
import { Prisma, RoomMember } from "../generated/prisma/client";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { roomRepository } from "../repos/roomRepository";
import { userRepository } from "../repos/userRepository";
import { toTRoom } from "./roomService";
import { toTUser } from "./userService";
import { TRoom } from "../domain/types";
import { toTRole } from "./roomService";

import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";
import { TRoomMember, TRoomAndMembers } from "../domain/types";
import { GAME_STATUS, IMAGE_PATH_MAP } from "../domain/common";
import { lineUtil } from "../util/lineUtil";
import { roleMasterService } from "./roleMasterService";

export function toTRoomMember(roomMember: RoomMember): TRoomMember {
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.userId,
    roleId: roomMember.roleId,
    joinedAt: roomMember.joinedAt,
  };
}

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
      return toTRoom(room);
    });
  },
  getRoomMembers: async (roomCode: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const roomWithUsers = await roomRepository.findWithUsersById(tx, room.id);
      const members =
        roomWithUsers?.members?.map((m) =>
          m.user
            ? {
                ...toTRoomMember(m),
                user: toTUser(m.user),
                role: toTRole(m.role),
              }
            : toTRoomMember(m)
        ) ?? [];
      return {
        room: toTRoom(room),
        members,
      };
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
  startGame: async (roomCode: string): Promise<TRoomAndMembers> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const roomMembers = await roomMemberRepository.getRoomMembers(
        tx,
        room.id
      );

      const assignedRoles = await assignRoles(shuffleArray(roomMembers));

      assignedRoles.forEach(async (member) => {
        await roomMemberRepository.updateRoomMemberRole(
          tx,
          room.id,
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
          "BBBB",
          "CCCC",
          member.role?.imageUrl ?? "",
          "https://joelle-unreleasable-defeatedly.ngrok-free.dev",
          "役割を確認"
        );
        if (!success) {
          console.error(
            `Failed to send notice role message to ${member.userId}`
          );
          throw new InternalServerError("Failed to send notice role message");
        }
      });
      return {
        room: toTRoom(room),
        members: assignedRoles,
      };
    });
  },
};

async function assignRoles(roomMembers: TRoomMember[]): Promise<TRoomMember[]> {
  const roles = await roleMasterService.getRoles();
  const sortedRoles = [...roles].sort((a, b) => b.priority - a.priority);
  console.log(sortedRoles);
  console.log("roomMembers", roomMembers);
  return roomMembers.map((member, index) => {
    const role = sortedRoles[index];
    console.log("role", role);
    return {
      ...member,
      roleId: role?.roleId ?? 0,
      role: role || sortedRoles[sortedRoles.length - 1],
    };
  });
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // 元の配列を破壊しない
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0〜i のランダムな整数
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  console.log("shuffledArray", arr);
  return arr;
}
