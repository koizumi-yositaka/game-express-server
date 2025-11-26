import { PrismaClient, Prisma, RoomMember } from "../generated/prisma/client";

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
      include: {
        user: true,
        role: true,
      },
    });
  },
  updateRoomMemberRole: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    roleId: number
  ) => {
    return await tx.roomMember.update({
      where: {
        roomId_userId: { roomId: roomId, userId: userId },
      },
      data: { roleId: roleId },
      include: {
        role: true,
      },
    });
  },
};
