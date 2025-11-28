import { PrismaClient, Prisma, RoomMember } from "../generated/prisma/client";
import { TDirection } from "../domain/types";

type TxClient = PrismaClient | Prisma.TransactionClient;

// room.members.user, room.members.role まで含む
export type RoomSessionWithMembers = Prisma.RoomSessionGetPayload<{
  include: {
    room: {
      include: { members: { include: { user: true; role: true } } };
    };
  };
}>;

export const roomSessionRepository = {
  createRoomSession: async (
    tx: TxClient,
    roomId: number,
    posX: number,
    posY: number,
    direction: TDirection,
    setting: string
  ) => {
    return await tx.roomSession.create({
      data: {
        roomId: roomId,
        posX: posX,
        posY: posY,
        direction: direction,
        setting: setting,
      },
    });
  },

  updateRoomSession: async (
    tx: TxClient,
    roomSessionId: number,
    posX: number,
    posY: number,
    turn: number,
    direction: TDirection
  ) => {
    return await tx.roomSession.update({
      where: { id: roomSessionId },
      data: { posX: posX, posY: posY, turn: turn, direction: direction },
    });
  },

  getRoomSession: async (
    tx: TxClient,
    roomSessionId: number
  ): Promise<RoomSessionWithMembers | null> => {
    return await tx.roomSession.findUnique({
      where: { id: roomSessionId },
      include: {
        room: { include: { members: { include: { user: true, role: true } } } },
      },
    });
  },
  getRoomSessionByRoomId: async (
    tx: TxClient,
    roomId: number
  ): Promise<RoomSessionWithMembers | null> => {
    return await tx.roomSession.findFirst({
      where: { roomId: roomId },
      include: {
        room: { include: { members: { include: { user: true, role: true } } } },
      },
    });
  },
};
