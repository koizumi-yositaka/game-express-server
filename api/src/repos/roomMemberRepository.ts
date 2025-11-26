import {
  PrismaClient,
  Prisma,
  RoomMember,
  User,
} from "../generated/prisma/client";
import { TRoom } from "../domain/types";

type TxClient = PrismaClient | Prisma.TransactionClient;

export const roomMemberRepository = {
  joinRoom: async (
    tx: TxClient,
    roomId: number,
    userId: string
  ): Promise<RoomMember | null> => {
    return await tx.roomMember.create({
      data: {
        roomId: roomId,
        userId: userId,
      },
    });
  },
  getRoomMembers: async (tx: TxClient, roomId: number) => {
    return await tx.roomMember.findMany({
      where: { roomId: roomId },
      include: {
        room: true,
      },
    });
  },
  isUserInOpenRoom: async (tx: TxClient, userId: string): Promise<boolean> => {
    const count = await tx.roomMember.count({
      where: {
        userId: userId,
        room: {
          openFlg: true,
        },
      },
    });
    return count > 0;
  },
  getRoomMemberByRoomCodeAndUserId: async (
    tx: TxClient,
    roomCode: string,
    userId: string
  ) => {
    return await tx.roomMember.findFirst({
      where: {
        room: {
          roomCode: roomCode,
        },
        user: {
          userId: userId,
        },
      },
    });
  },
  updateRoomMemberRole: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    role: number
  ) => {
    return await tx.roomMember.update({
      where: {
        roomId_userId: { roomId: roomId, userId: userId },
      },
      data: { role: role },
    });
  },
};
