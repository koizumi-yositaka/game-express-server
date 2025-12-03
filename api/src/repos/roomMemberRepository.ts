import { PrismaClient, Prisma, RoomMember } from "../generated/prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export type RoomMemberWithUsers = Prisma.RoomMemberGetPayload<{
  include: {
    user: true;
    role: true;
  };
}>;
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
  updateRoomMemberStatus: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    status: number
  ) => {
    return await tx.roomMember.update({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      data: { status: status },
    });
  },
  // 以下get
  // これは役割が振られる前にしか使わないので、roleは含めない
  getRoomMembers: async (tx: TxClient, roomId: number) => {
    return await tx.roomMember.findMany({
      where: { roomId: roomId },
      include: {
        room: true,
      },
    });
  },
  getRoomMemberByRoomCodeAndUserId: async (
    tx: TxClient,
    roomCode: string,
    userId: string
  ): Promise<RoomMemberWithUsers | null> => {
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
};
