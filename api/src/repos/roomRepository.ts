import {
  PrismaClient,
  Prisma,
  RoomMember,
  User,
} from "../generated/prisma/client";
import { TRoom } from "../domain/types";

type TxClient = PrismaClient | Prisma.TransactionClient;
import { Room } from "../generated/prisma/client";

// members まで
export type RoomWithMembers = Prisma.RoomGetPayload<{
  include: {
    members: true;
  };
}>;

// members.user まで
export type RoomWithUsers = Prisma.RoomGetPayload<{
  include: {
    members: {
      include: { user: true };
    };
  };
}>;

export const roomRepository = {
  createRoom: async (tx: TxClient, roomCode: string): Promise<Room | null> => {
    const room = await tx.room.create({
      data: {
        roomCode: roomCode,
        status: 0,
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
  getRoomByRoomCode: async (
    tx: TxClient,
    roomCode: string
  ): Promise<Room | null> => {
    const room = await tx.room.findUnique({
      where: { roomCode: roomCode },
    });
    return room;
  },
  getRoomById: async (tx: TxClient, roomId: number): Promise<Room | null> => {
    const room = await tx.room.findUnique({
      where: { id: roomId },
    });
    return room;
  },

  async findWithMembersById(
    tx: TxClient,
    roomId: number
  ): Promise<RoomWithMembers | null> {
    return tx.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
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
        members: {
          include: { user: true },
        },
      },
    });
  },
};
