import { NextFunction, Request, Response } from "express";
import { roomService } from "../services/roomService";
import {
  roomMemberService,
  type RoomAndMembers,
} from "../services/roomMemberService";
import { TRoom } from "../domain/types";

import z from "zod";

type DTORoom = {
  id?: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: Date;
};

type DTOTRoomMember = {
  id: number;
  roomId: number;
  userId: string;
  role: number;
  joinedAt: Date;
};

type DTORoomMembers = {
  room: DTORoom;
  members: DTOTRoomMember[];
};
// ルーム作成のスキーマ
export const createRoomSchema = z.object({
  roomCode: z.string().length(4),
});
export const closeRoomParamsSchema = z.object({
  roomCode: z.string().length(4),
});
export const addRoomMemberParamsSchema = z.object({
  roomCode: z.string().length(4),
});
export const addRoomMemberBodySchema = z.object({
  userId: z.string(),
});
export const getRoomMembersParamsSchema = z.object({
  roomCode: z.string().length(4),
});

export const getRoomMemberParamsSchema = z.object({
  roomCode: z.string().length(4),
  userId: z.string(),
});
export const startGameParamsSchema = z.object({
  roomCode: z.string().length(4),
});
export type CreateRoomRequestBody = z.infer<typeof createRoomSchema>;
export type CloseRoomRequestParams = z.infer<typeof closeRoomParamsSchema>;
export type AddRoomMemberParams = z.infer<typeof addRoomMemberParamsSchema>;
export type AddRoomMemberBody = z.infer<typeof addRoomMemberBodySchema>;
export type GetRoomMembersParams = z.infer<typeof getRoomMembersParamsSchema>;
export type GetRoomMemberParams = z.infer<typeof getRoomMemberParamsSchema>;
export type StartGameParams = z.infer<typeof startGameParamsSchema>;
export const roomController = {
  /**
   * ルームを作成する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  createRoom: async (
    req: Request<unknown, unknown, CreateRoomRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log(req.body.roomCode);
      const room = await roomService.createRoom();
      res.status(200).json(toDTORoom(room));
    } catch (error) {
      next(error);
    }
  },
  /**
   * ルームを閉じる
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  closeRoom: async (
    req: Request<CloseRoomRequestParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await roomService.closeRoom(req.params.roomCode);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  /**
   * ルームにメンバーを追加する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  addRoomMember: async (
    req: Request<AddRoomMemberParams, unknown, AddRoomMemberBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const room = toDTORoom(
        await roomMemberService.joinRoom(req.params.roomCode, req.body.userId)
      );
      res.status(200).json(room);
    } catch (error) {
      next(error);
    }
  },
  /**
   * ルームのメンバーを取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  getRoomMembers: async (
    req: Request<GetRoomMembersParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roomMembers = await roomMemberService.getRoomMembers(
        req.params.roomCode
      );
      res.status(200).json(roomMembers);
    } catch (error) {
      next(error);
    }
  },
  getRoomMember: async (
    req: Request<GetRoomMemberParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roomMember = await roomMemberService.getRoomMember(
        req.params.roomCode,
        req.params.userId
      );
      res.status(200).json(roomMember);
    } catch (error) {
      next(error);
    }
  },
  startGame: async (
    req: Request<StartGameParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roomAndMembers = await roomMemberService.startGame(
        req.params.roomCode
      );
      res.status(200).json(toDTORoomMembers(roomAndMembers));
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
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
  };
}
function toDTORoomMembers(roomMembers: RoomAndMembers): DTORoomMembers {
  const room = toDTORoom(roomMembers.room)!;
  const members = roomMembers.members.map((member) => {
    return {
      id: member.id,
      roomId: member.roomId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
    };
  });
  return {
    room: room,
    members: members,
  };
}
