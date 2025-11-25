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
};
