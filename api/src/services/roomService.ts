import { Room, RoomMember } from "../generated/prisma/client";
import { roomRepository } from "../repos/roomRepository";
import { TRoomMember, type TRoom } from "../domain/types";
import { randomInt } from "crypto";
import { prisma } from "../db/prisma";
import { Prisma } from "../generated/prisma/client";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";
import { roomMemberRepository } from "../repos/roomMemberRepository";

export function toTRoom(room: Room | null): TRoom | null {
  if (!room) return null;
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
  };
}

const ATTEMPTS_LIMIT = 5;

export const roomService = {
  createRoom: async (): Promise<TRoom | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let attempts = 0;
      let roomCode = "";
      while (attempts < ATTEMPTS_LIMIT) {
        roomCode = generate4DigitCode();
        let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
        // roomIdが存在しない場合はこのroomCodeを使う
        if (!room) {
          return toTRoom(await roomRepository.createRoom(tx, roomCode));
        } else if (room && !room.openFlg) {
          return toTRoom(
            await roomRepository.updateRoom(tx, room.id, { openFlg: true })
          );
        }
        attempts++;
      }
      throw new InternalServerError("Failed to create room");
    });
  },
  closeRoom: async (roomCode: string): Promise<TRoom | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (!room.openFlg) {
        throw new BadRequestError("Room is already closed");
      }
      return toTRoom(
        await roomRepository.updateRoom(tx, room.id, { openFlg: false })
      );
    });
  },
  updateRoomStatus: async (
    roomCode: string,
    status: number
  ): Promise<TRoom | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room = await roomRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return toTRoom(await roomRepository.updateRoom(tx, room.id, { status }));
    });
  },
};

function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}
