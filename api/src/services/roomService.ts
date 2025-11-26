import { MRole, Prisma } from "../generated/prisma/client";
import { Room } from "../generated/prisma/client";
import { roomRepository } from "../repos/roomRepository";
import { TRole, type TRoom, type TRoomAndMembers } from "../domain/types";
import { randomInt } from "crypto";
import { prisma } from "../db/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";
import { toTRoomMember } from "./roomMemberService";

const ATTEMPTS_LIMIT = 5;

export const roomService = {
  createRoom: async (): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let attempts = 0;
      let roomCode = "";
      while (attempts < ATTEMPTS_LIMIT) {
        roomCode = generate4DigitCode();
        let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
        // roomIdが存在しない場合はこのroomCodeを使う
        if (!room) {
          const createdRoom = await roomRepository.createRoom(tx, roomCode);
          if (!createdRoom) {
            throw new InternalServerError("Failed to create room");
          }
          return toTRoom(createdRoom);
        } else if (room && !room.openFlg) {
          const reopenedRoom = await roomRepository.updateRoom(tx, room.id, {
            openFlg: true,
          });
          if (!reopenedRoom) {
            throw new InternalServerError("Failed to reopen room");
          }
          return toTRoom(reopenedRoom);
        }
        attempts++;
      }
      throw new InternalServerError("Failed to create room");
    });
  },
  closeRoom: async (roomCode: string): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (!room.openFlg) {
        throw new BadRequestError("Room is already closed");
      }
      const closedRoom = await roomRepository.updateRoom(tx, room.id, {
        openFlg: false,
      });
      if (!closedRoom) {
        throw new InternalServerError("Failed to close room");
      }
      return toTRoom(closedRoom);
    });
  },
  updateRoomStatus: async (
    roomCode: string,
    status: number
  ): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const updatedRoom = await roomRepository.updateRoom(tx, room.id, {
        status,
      });
      if (!updatedRoom) {
        throw new InternalServerError("Failed to update room status");
      }
      return toTRoom(updatedRoom);
    });
  },
  getAllRooms: async (): Promise<TRoomAndMembers[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rooms = await roomRepository.getRooms(tx, {});
      console.log("rooms", rooms);
      const roomAndMembers = rooms.map((room) => {
        return {
          room: toTRoom(room),
          members: room.members.map((member) => toTRoomMember(member)),
        };
      });
      return roomAndMembers;
    });
  },
  getRoomInfoByRoomCode: async (roomCode: string): Promise<TRoomAndMembers> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rooms = await roomRepository.getRooms(tx, { roomCode });
      if (rooms.length === 0) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return {
        room: toTRoom(rooms[0]),
        members: rooms[0].members.map((member) => toTRoomMember(member)),
      };
    });
  },
};

function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}

export function toTRoom(room: Room): TRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
  };
}

export function toTRole(role: MRole): TRole {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    priority: role.priority,
    description: role.description ?? "",
    imageUrl: role.imageUrl ?? "",
  };
}
