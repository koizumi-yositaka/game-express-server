import { prisma } from "../db/prisma";
import { Prisma, RoomMember } from "../generated/prisma/client";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { roomRepository } from "../repos/roomRepository";
import { userRepository } from "../repos/userRepository";
import { toTRoom } from "./roomService";
import { TRoom } from "../domain/types";

import { BadRequestError, NotFoundError } from "../error/AppError";
import { TRoomMember } from "../domain/types";
export type RoomAndMembers = {
  room: TRoom;
  members: TRoomMember[];
};

export function toTRoomMember(
  roomMember: RoomMember | null
): TRoomMember | null {
  if (!roomMember) return null;
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.userId,
    role: roomMember.role,
    joinedAt: roomMember.joinedAt,
  };
}

export const roomMemberService = {
  joinRoom: async (roomCode: string, userId: string): Promise<TRoom | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (room.status !== 0) {
        throw new BadRequestError("Roomは募集中ではありません");
      }
      const memberInfo = await userRepository.getUser(tx, userId);
      if (!memberInfo) {
        throw new NotFoundError("User not found");
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
        roomWithUsers?.members?.map((m) => toTRoomMember(m)) ?? [];
      return {
        room,
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
      return toTRoomMember(roomMember);
    });
  },
  startGame: async (roomCode: string): Promise<RoomAndMembers> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const roomMembers = await roomMemberRepository.getRoomMembers(
        tx,
        room.id
      );
      const assignedRoles = assignRoles(roomMembers);
      for (const member of assignedRoles) {
        await roomMemberRepository.updateRoomMemberRole(
          tx,
          room.id,
          member.userId,
          member.role
        );
      }
      // if (roomMembers.length < 2) {
      //   throw new BadRequestError("部屋に参加者が2人未満です");
      // }
      return {
        room: toTRoom(room)!,
        members: assignedRoles,
      };
    });
  },
};
function assignRoles(roomMembers: TRoomMember[]): TRoomMember[] {
  return roomMembers.map((member) => {
    return {
      ...member,
      role: Math.random() > 0.5 ? 1 : 2,
    };
  });
}
