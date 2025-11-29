import { MRole, Prisma } from "../generated/prisma/client";
import { Room } from "../generated/prisma/client";
import { roomRepository, RoomWithUsers } from "../repos/roomRepository";
import { TRole, TRoomMember, type TRoom } from "../domain/types";
import { randomInt } from "crypto";
import { prisma } from "../db/prisma";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";

import { roomSessionService } from "./roomSessionService";
import { toTRoom, toTRoomFromRoomWithUsers } from "../domain/typeParse";
import { lineUtil } from "../util/lineUtil";

const ATTEMPTS_LIMIT = 5;

export const roomService = {
  // 部屋を作成する 初期状態ではメンバーはいない
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
          return toTRoom(createdRoom, []);
        } else if (room && !room.openFlg) {
          const reopenedRoom = await roomRepository.updateRoom(tx, room.id, {
            openFlg: true,
          });
          if (!reopenedRoom) {
            throw new InternalServerError("Failed to reopen room");
          }
          await roomSessionService.createRoomSession(reopenedRoom.id);
          return toTRoom(reopenedRoom, []);
        }
        attempts++;
      }
      throw new InternalServerError("Failed to create room");
    });
  },
  closeRoom: async (roomCode: string): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room: RoomWithUsers | null = await roomRepository.getRoomByRoomCode(
        tx,
        roomCode
      );
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
      const roomSession = await roomSessionService.getRoomSessionByRoomId(
        closedRoom.id
      );
      if (roomSession) {
        roomSession.room.members.forEach(async (member) => {
          await lineUtil.sendSimpleTextMessage(
            member.userId,
            `ROOM[${closedRoom.roomCode}] CLOSED`
          );
        });
      }
      return toTRoom(closedRoom, []);
    });
  },
  updateRoomStatus: async (
    roomCode: string,
    status: number
  ): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room: RoomWithUsers | null = await roomRepository.getRoomByRoomCode(
        tx,
        roomCode
      );
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const updatedRoom = await roomRepository.updateRoom(tx, room.id, {
        status,
      });
      if (!updatedRoom) {
        throw new InternalServerError("Failed to update room status");
      }
      return toTRoom(updatedRoom, room.members);
    });
  },
  getAllRooms: async (): Promise<TRoom[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rooms: RoomWithUsers[] = await roomRepository.getRooms(tx, {});
      return rooms.map((room) => toTRoomFromRoomWithUsers(room));
    });
  },
  getRoomInfoByRoomCode: async (roomCode: string): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room: RoomWithUsers | null = await roomRepository.getRoomByRoomCode(
        tx,
        roomCode
      );
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return toTRoomFromRoomWithUsers(room);
    });
  },
  getRoomByRoomCode: async (roomCode: string): Promise<TRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room: RoomWithUsers | null = await roomRepository.getRoomByRoomCode(
        tx,
        roomCode
      );
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return toTRoomFromRoomWithUsers(room);
    });
  },
};

function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}
