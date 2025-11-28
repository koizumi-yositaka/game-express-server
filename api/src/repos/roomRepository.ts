import { PrismaClient, Prisma } from "../generated/prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;
import { Room } from "../generated/prisma/client";
import { GAME_STATUS } from "../domain/common";

// members.user まで
export type RoomWithUsers = Prisma.RoomGetPayload<{
  include: {
    members: {
      include: { user: true; role: true };
    };
  };
}>;

export const roomRepository = {
  getRooms: async (
    tx: TxClient,
    searchParams: { roomCode?: string }
  ): Promise<RoomWithUsers[]> => {
    const rooms = await tx.room.findMany({
      where: {
        openFlg: true,
        ...(searchParams.roomCode && { roomCode: searchParams.roomCode }),
      },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return rooms;
  },
  getRoomByRoomCode: async (
    tx: TxClient,
    roomCode: string
  ): Promise<RoomWithUsers | null> => {
    const room = await tx.room.findUnique({
      where: { roomCode: roomCode },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return room;
  },
  getRoomById: async (
    tx: TxClient,
    roomId: number
  ): Promise<RoomWithUsers | null> => {
    const room = await tx.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return room;
  },

  async findWithMembersById(
    tx: TxClient,
    roomId: number
  ): Promise<RoomWithUsers | null> {
    return tx.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
  },

  async findWithUsersById(
    tx: TxClient,
    roomId: number
  ): Promise<RoomWithUsers | null> {
    return tx.room.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
  },

  createRoom: async (tx: TxClient, roomCode: string): Promise<Room | null> => {
    const room = await tx.room.create({
      data: {
        roomCode: roomCode,
        status: GAME_STATUS.NOT_STARTED,
        openFlg: true,
      },
    });
    return room;
  },
  updateRoom: async (
    tx: TxClient,
    roomId: number,
    updateVal: { openFlg?: boolean; status?: number }
  ): Promise<Room | null> => {
    const updateData = {
      ...(updateVal.openFlg !== undefined && { openFlg: updateVal.openFlg }),
      ...(updateVal.status !== undefined && { status: updateVal.status }),
    };
    const updatedRoom = await tx.room.update({
      where: { id: roomId },
      data: updateData,
    });
    return updatedRoom;
  },
};
