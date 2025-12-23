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
import { DecodedUserInfo } from "../domain/proof/types";
import { DTOProofStatus, DTOProofUser } from "./proof/dto";
import { PROOF_MEMBER_STATUS, PROOF_STATUS } from "../domain/proof/proofCommon";
export const roomCodeParamsSchema = z.object({
  roomCode: z.string().length(4),
});
export const addRoomMemberBodySchema = z.object({
  userId: z.string(),
});

export const memberIdSchema = z.object({
  memberId: z.string(),
});
export const optionalMemberIdParamsSchema = z.object({
  memberId: z.string().optional(),
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

export const roomSessionIdAndMemberIdSchema = z.object({
  roomSessionId: z.string(),
  memberId: z.string(),
});

export const roomSessionIdAndProofCodeSchema = z.object({
  roomSessionId: z.string(),
  proofCode: z.string(),
});

export const revealProofBodySchema = z.object({
  memberId: z.number(),
  isEntire: z.boolean(),
});

export const judgeAlreadyRevealedBodySchema = z.object({
  memberId: z.number(),
  roomSessionId: z.number(),
  turn: z.number(),
});

export const tokenBodySchema = z.object({
  token: z.string(),
});

export const createBombBodySchema = z.object({
  proofCodes: z.array(z.string()),
  memberId: z.number(),
});

export const proofCodesBodySchema = z.object({
  proofCodes: z.array(z.string()),
});

export const useSkillBodySchema = z.object({
  params: z.unknown(),
});

export const requestReportBodySchema = z.object({
  targetMemberId: z.number(),
  proofCodes: z.array(z.string()),
});

export const forceFocusBodySchema = z.object({
  memberId: z.number(),
  roomSessionId: z.number(),
  isFocus: z.boolean(),
});

export type MemberIdSchema = z.infer<typeof memberIdSchema>;
export type RevealProofBody = z.infer<typeof revealProofBodySchema>;
export type RoomCodeParams = z.infer<typeof roomCodeParamsSchema>;
export type AddRoomMemberBody = z.infer<typeof addRoomMemberBodySchema>;
export type AddRoomMembersBody = z.infer<typeof addRoomMembersBodySchema>;
export type RoomIdSchema = z.infer<typeof roomIdSchema>;
export type RoomSessionIdSchema = z.infer<typeof roomSessionIdSchema>;
export type RoomSessionIdAndProofCodeSchema = z.infer<
  typeof roomSessionIdAndProofCodeSchema
>;
export type OptionalMemberIdParamsSchema = z.infer<
  typeof optionalMemberIdParamsSchema
>;
export type CreateBombBodySchema = z.infer<typeof createBombBodySchema>;
export type TokenBody = z.infer<typeof tokenBodySchema>;
export type ForceFocusBodySchema = z.infer<typeof forceFocusBodySchema>;
export type JudgeAlreadyRevealedBodySchema = z.infer<
  typeof judgeAlreadyRevealedBodySchema
>;
export type RoomSessionIdAndMemberIdSchema = z.infer<
  typeof roomSessionIdAndMemberIdSchema
>;
export type ProofCodesBodySchema = z.infer<typeof proofCodesBodySchema>;
export type UseSkillBodySchema = z.infer<typeof useSkillBodySchema>;
export type RequestReportBodySchema = z.infer<typeof requestReportBodySchema>;
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
      if (isNaN(Number(req.params.roomSessionId))) {
        throw new BadRequestError("roomSessionId must be a number");
      }
      const roomSession = await proofService.getRoomSession(
        Number(req.params.roomSessionId)
      );
      res.status(200).json(toDTOProofRoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },

  getRoleSetting: async (
    req: Request<RoomSessionIdAndMemberIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roleSetting = await proofService.getRoleSetting(
        Number(req.params.roomSessionId),
        Number(req.params.memberId)
      );
      res.status(200).json(roleSetting);
    } catch (error) {
      next(error);
    }
  },

  getProofList: async (
    req: Request<RoomSessionIdSchema, OptionalMemberIdParamsSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const memberId = req.query.memberId
        ? Number(req.query.memberId)
        : undefined;
      const proofs = await proofService.getProofList(
        Number(req.params.roomSessionId),
        memberId
      );
      res.status(200).json(proofs.map((proof) => toDTOProof(proof)));
    } catch (error) {
      next(error);
    }
  },
  getProofStatus: async (
    req: Request<RoomSessionIdAndProofCodeSchema, MemberIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const memberId = req.query.memberId;
      const proof = await proofService.getProofStatus(
        Number(req.params.roomSessionId),
        req.params.proofCode
      );

      const dtoProofStatus: DTOProofStatus = {
        isExists: proof !== null,
        ableToOpenToPublic:
          proof !== null && proof.status !== PROOF_STATUS.REVEALED_TO_ALL,
        ableToOpenToPrivate:
          proof !== null &&
          proof.status !== PROOF_STATUS.REVEALED_TO_ALL &&
          !proof.revealedBy.includes(Number(memberId)),
      };
      res.status(200).json(dtoProofStatus);
    } catch (error) {
      next(error);
    }
  },

  judgeAlreadyRevealed: async (
    req: Request<unknown, unknown, JudgeAlreadyRevealedBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const isAlreadyRevealed = await proofService.judgeAlreadyRevealed(
        req.body.roomSessionId,
        req.body.turn,
        req.body.memberId
      );
      res.status(200).json({ result: isAlreadyRevealed });
    } catch (error) {
      next(error);
    }
  },

  includeBomb: async (
    req: Request<RoomSessionIdSchema, unknown, ProofCodesBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const proofStatuses = await Promise.all(
        req.body.proofCodes.map(async (proofCode) => {
          return proofService.getProofStatus(
            Number(req.params.roomSessionId),
            proofCode
          );
        })
      );
      const includeBomb = proofStatuses.some(
        (proofStatus) => proofStatus?.bomFlg
      );
      res.status(200).json({ includeBomb });
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
        req.body.isEntire,
        req.app.locals.io
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
  initializeBomb: async (
    req: Request<RoomSessionIdSchema, unknown, CreateBombBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await proofService.initializeBomb(
        Number(req.params.roomSessionId),
        req.body.proofCodes,
        req.body.memberId,
        req.app.locals.io
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
      //await new Promise((resolve) => setTimeout(resolve, 2000));
      const token = await myUtil.decrypt(req.body.token);
      const userInfo = JSON.parse(token) as DecodedUserInfo;
      res.status(200).json(userInfo);
    } catch (error) {
      next(error);
    }
  },

  // turn
  startTurn: async (
    req: Request<RoomSessionIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const nextTurn = await proofService.startTurn(
        req.app.locals.io,
        Number(req.params.roomSessionId)
      );
      res.status(200).json({ result: `success ${nextTurn}` });
    } catch (error) {
      next(error);
    }
  },

  startOrder: async (
    req: Request<RoomSessionIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await proofService.startOrder(
        Number(req.params.roomSessionId),
        req.app.locals.io
      );
      res.status(200).json({ result: "success" });
    } catch (error) {
      next(error);
    }
  },

  useSkill: async (
    req: Request<RoomSessionIdAndMemberIdSchema, unknown, UseSkillBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await proofService.useSkill(
        Number(req.params.roomSessionId),
        Number(req.params.memberId),
        req.app.locals.io,
        req.body.params
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  endOrder: async (
    req: Request<RoomSessionIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { turnFinished, currentTurn } = await proofService.endOrder(
        Number(req.params.roomSessionId),
        req.app.locals.io
      );
      res.status(200).json({ turnFinished, currentTurn });
    } catch (error) {
      next(error);
    }
  },
  requestReport: async (
    req: Request<
      RoomSessionIdAndMemberIdSchema,
      unknown,
      RequestReportBodySchema
    >,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await proofService.requestReport(
        Number(req.params.roomSessionId),
        Number(req.params.memberId),
        req.body.targetMemberId,
        req.body.proofCodes,
        req.app.locals.io
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  _forceFocus: async (
    req: Request<unknown, unknown, ForceFocusBodySchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      await proofService._forceFocus(
        req.body.roomSessionId,
        req.app.locals.io,
        req.body.memberId,
        req.body.isFocus
      );
      res.status(200).json({ result: "success" });
    } catch (error) {
      next(error);
    }
  },
};
