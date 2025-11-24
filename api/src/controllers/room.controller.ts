import { NextFunction, Request, Response } from "express";
import { roomService } from "../services/roomService";
import { TRoom } from "../domain/types";

import z from "zod";

type DTORoom = {
  id?: number;
  roomCode: string;
  openFlg: boolean;
  createdAt: Date;
};

// ルーム作成のスキーマ
export const createRoomSchema = z.object({
  code: z.string().length(4),
});
export const closeRoomSchema = z.object({
  code: z.string().length(4),
});
export type CreateRoomRequestBody = z.infer<typeof createRoomSchema>;
export type CloseRoomRequestBody = z.infer<typeof closeRoomSchema>;

export const roomController = {
  createRoom: async (
    req: Request<unknown, unknown, CreateRoomRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.body.code);
      const room = await roomService.createRoom();
      res.status(200).json(toDTORoom(room));
    } catch (error) {
      next(error);
    }
  },
  closeRoom: async (
    req: Request<CloseRoomRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await roomService.closeRoom(req.params.code);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};

function toDTORoom(room: TRoom | null): DTORoom | null {
  if (!room) return null;
  return {
    id: room.id,
    roomCode: room.roomCode,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
  };
}
