import { NextFunction, Request, Response } from "express";
import z from "zod";
import { proofService } from "../services/proofService";
import {
  toDTOProof,
  toDTOProofRoom,
  toDTOProofRoomSession,
} from "./proof/dtoParse";
import { BadRequestError } from "../error/AppError";
import { myUtil } from "../util/myUtil";
import { UserToken } from "../domain/proof/types";

export const roomCodeParamsSchema = z.object({
  roomCode: z.string().length(4),
});
export const addRoomMemberBodySchema = z.object({
  userId: z.string(),
});

export const addRoomMembersBodySchema = z.object({
  userIds: z.array(z.string()),
});

export const roomIdSchema = z.object({
  roomId: z.string(),
});
export const roomSessionIdSchema = z.object({
  roomSessionId: z.string(),
});

export const roomSessionIdAndProofCodeSchema = z.object({
  roomSessionId: z.string(),
  proofCode: z.string(),
});

export const revealProofBodySchema = z.object({
  memberId: z.number(),
  isEntire: z.boolean(),
});

export const tokenBodySchema = z.object({
  token: z.string(),
});

export const createBombBodySchema = z.object({
  proofCodes: z.array(z.string()),
  memberId: z.number(),
});

export type RevealProofBody = z.infer<typeof revealProofBodySchema>;
export type RoomCodeParams = z.infer<typeof roomCodeParamsSchema>;
export type AddRoomMemberBody = z.infer<typeof addRoomMemberBodySchema>;
export type AddRoomMembersBody = z.infer<typeof addRoomMembersBodySchema>;
export type RoomIdSchema = z.infer<typeof roomIdSchema>;
export type RoomSessionIdSchema = z.infer<typeof roomSessionIdSchema>;
export type RoomSessionIdAndProofCodeSchema = z.infer<
  typeof roomSessionIdAndProofCodeSchema
>;
export type CreateBombBodySchema = z.infer<typeof createBombBodySchema>;
export type TokenBody = z.infer<typeof tokenBodySchema>;
export const proofController = {
  getHealth: (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: "ok" });
  },
  createRoom: async (_: Request, res: Response, next: NextFunction) => {
    try {
      // roomの情報
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const room = await proofService.createProofRoom();
      res.status(200).json(toDTOProofRoom(room));
    } catch (error) {
      next(error);
    }
  },
  addRoomMember: async (
    req: Request<RoomCodeParams, unknown, AddRoomMemberBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const room = toDTOProofRoom(
        await proofService.joinRoom(req.params.roomCode, req.body.userId)
      );
      res.status(200).json(room);
    } catch (error) {
      next(error);
    }
  },
  _addRoomMembers: async (
    req: Request<RoomCodeParams, unknown, AddRoomMembersBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const members = req.body.userIds.map((userId) => ({
        userId: userId,
      }));
      for (const member of members) {
        await proofService.joinRoom(req.params.roomCode, member.userId);
      }
      res.status(200).json({ count: members.length });
    } catch (error) {
      next(error);
    }
  },
  closeRoom: async (
    req: Request<RoomCodeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await proofService.closeRoom(req.params.roomCode);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  getAllRooms: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const rooms = await proofService.getAllRooms();
      res.status(200).json(rooms.map((room) => toDTOProofRoom(room)));
    } catch (error) {
      next(error);
    }
  },
  getRoomByRoomCode: async (
    req: Request<RoomCodeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const room = await proofService.getRoomByRoomCode(req.params.roomCode);
      res.status(200).json(toDTOProofRoom(room));
    } catch (error) {
      next(error);
    }
  },
  /** #region startGame */
  startGame: async (
    req: Request<RoomCodeParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { roomCode } = req.params;
      const roomSession = await proofService.startGame(roomCode);
      //
      res.status(200).json(toDTOProofRoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },

  getRoomSessionByRoomId: async (
    req: Request<RoomIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("req.query", req.query);
      if (isNaN(Number(req.query.roomId))) {
        throw new BadRequestError("roomId must be a number");
      }
      const roomSession = await proofService.getRoomSessionByRoomId(
        Number(req.query.roomId)
      );
      res.status(200).json(toDTOProofRoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },
  getRoomSessionById: async (
    req: Request<RoomSessionIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      console.log("req.params", req.params);
      console.log("req.params.roomSessionId", req.params.roomSessionId);
      if (isNaN(Number(req.params.roomSessionId))) {
        throw new BadRequestError("roomSessionId must be a number");
      }
      const roomSession = await proofService.getRoomSession(
        Number(req.params.roomSessionId),
        false
      );
      res.status(200).json(toDTOProofRoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },

  getProofByRoomSessionIdAndCode: async (
    req: Request<RoomSessionIdAndProofCodeSchema, unknown, RevealProofBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const revealedResult = await proofService.revealProof(
        Number(req.params.roomSessionId),
        req.params.proofCode,
        req.body.memberId,
        req.body.isEntire
      );
      res.status(200).json({
        result: revealedResult.result,
        message: revealedResult.message,
        proof: revealedResult.proof ? toDTOProof(revealedResult.proof) : null,
      });
    } catch (error) {
      next(error);
    }
  },
  createBomb: async (
    req: Request<RoomSessionIdSchema, unknown, CreateBombBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await proofService.createBomb(
        Number(req.params.roomSessionId),
        req.body.proofCodes,
        req.body.memberId
      );
      res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  },

  decodeToken: async (
    req: Request<unknown, unknown, TokenBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const token = await myUtil.decrypt(req.body.token);
      const userToken = JSON.parse(token) as UserToken;

      res.status(200).json(userToken);
    } catch (error) {
      next(error);
    }
  },
};
