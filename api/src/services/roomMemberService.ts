import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { roomRepository } from "../repos/roomRepository";
import { userRepository } from "../repos/userRepository";
import { toTRoom } from "./roomService";
import { TRoom, TUser } from "../domain/types";
import { toTUser } from "./userService";
export type RoomAndUsers = {
  room: TRoom;
  members: TUser[];
};

export const roomMemberService = {
  joinRoom: async (roomCode: string, userId: string): Promise<TRoom | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new Error("Room not found");
      }
      const memberInfo = await userRepository.getUser(tx, userId);
      if (!memberInfo) {
        throw new Error("User not found");
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
        throw new Error("Room not found");
      }
      const roomWithUsers = await roomRepository.findWithUsersById(tx, room.id);
      const members = roomWithUsers?.members?.map((m) => toTUser(m.user));
      return {
        room,
        members,
      };
    });
  },
};
