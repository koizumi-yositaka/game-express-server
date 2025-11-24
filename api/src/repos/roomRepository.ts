import { PrismaClient, Prisma } from "../generated/prisma/client";
import { TRoom } from "../domain/types";

type TxClient = PrismaClient | Prisma.TransactionClient;
import { Room } from "../generated/prisma/client";
export const roomRepository = {
  createRoom: async (tx: TxClient, roomCode: string): Promise<Room | null> => {
    const room = await tx.room.create({
      data: {
        roomCode: roomCode,
        openFlg: true,
      },
    });
    return room;
  },
  updateRoom: async (
    tx: TxClient,
    roomId: number,
    updateVal: { openFlg: boolean }
  ): Promise<Room | null> => {
    const updatedRoom = await tx.room.update({
      where: { id: roomId },
      data: { openFlg: updateVal.openFlg },
    });
    return updatedRoom;
  },
  // closeRoom: async () => {
  //   await prisma.room.update({
  //     where: { id: roo },
  //     data: { openFlg: false },
  //   });
  //   return { message: "room closed" };
  // },
  getRoomByRoomCode: async (
    tx: TxClient,
    roomCode: string
  ): Promise<Room | null> => {
    const room = await tx.room.findUnique({
      where: { roomCode: roomCode },
    });
    return room;
  },
};
