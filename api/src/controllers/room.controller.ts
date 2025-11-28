import { NextFunction, Request, Response } from "express";
import { roomService } from "../services/roomService";
import { roomMemberService } from "../services/roomMemberService";
import { toDTORoom, toDTORoomMember, toDTORoomSession } from "./dtoParse";

import z from "zod";
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
  createRoom: async (_: Request, res: Response, next: NextFunction) => {
    try {
      // roomの情報
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
      res
        .status(200)
        .json(roomMembers.map((roomMember) => toDTORoomMember(roomMember)));
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
      res.status(200).json(toDTORoomMember(roomMember));
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
      res.status(200).json(toDTORoomSession(roomAndMembers));
    } catch (error) {
      next(error);
    }
  },
  getAllRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rooms = await roomService.getAllRooms();
      res
        .status(200)
        .json(rooms.map((roomAndMembers) => toDTORoom(roomAndMembers)));
    } catch (error) {
      next(error);
    }
  },
  getRoomByRoomCode: async (
    req: Request<GetRoomMembersParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const room = await roomService.getRoomByRoomCode(req.params.roomCode);
      res.status(200).json(toDTORoom(room));
    } catch (error) {
      next(error);
    }
  },
};
