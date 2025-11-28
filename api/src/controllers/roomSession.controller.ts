import { NextFunction, Request, Response } from "express";
import { roomSessionService } from "../services/roomSessionService";
import z from "zod";
import {
  TCommand,
  TRoom,
  TRoomSession,
  CommandTypeSchema,
  TRoomMember,
} from "../domain/types";
import { BadRequestError } from "../error/AppError";
import { toDTORoomSession } from "./dtoParse";

export const roomIdSchema = z.object({
  roomId: z.string(),
});
export const roomSessionIdSchema = z.object({
  roomSessionId: z.string(),
});

export const addCommandsBodySchema = z.object({
  commands: z.array(
    z.object({
      memberId: z.number(),
      commandType: CommandTypeSchema,
    })
  ),
});
export type RoomIdSchema = z.infer<typeof roomIdSchema>;
export type RoomSessionIdSchema = z.infer<typeof roomSessionIdSchema>;
export type AddCommandsBody = z.infer<typeof addCommandsBodySchema>;
export const roomSessionController = {
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
      const roomSession = await roomSessionService.getRoomSessionByRoomId(
        Number(req.query.roomId)
      );
      res.status(200).json(toDTORoomSession(roomSession));
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
      const roomSession = await roomSessionService.getRoomSession(
        Number(req.params.roomSessionId)
      );
      res.status(200).json(toDTORoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },
  createRoomSession: async (
    req: Request<RoomIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (isNaN(Number(req.params.roomId))) {
        throw new BadRequestError("roomId must be a number");
      }
      const roomSession = await roomSessionService.createRoomSession(
        Number(req.params.roomId)
      );
      res.status(200).json(toDTORoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },
  addCommands: async (
    req: Request<RoomSessionIdSchema, unknown, AddCommandsBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { commands } = req.body;
      if (isNaN(Number(req.params.roomSessionId))) {
        throw new BadRequestError("roomSessionId must be a number");
      }
      const commandList: TCommand[] = commands.map((command) => ({
        roomSessionId: Number(req.params.roomSessionId),
        memberId: command.memberId,
        commandType: command.commandType,
        processed: false,
      }));
      const result = await roomSessionService.addCommands(
        Number(req.params.roomSessionId),
        commandList
      );
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },
  stepRoomSession: async (
    req: Request<RoomSessionIdSchema>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const roomSession = await roomSessionService.reflectCommands(
        Number(req.params.roomSessionId)
      );
      res.status(200).json(toDTORoomSession(roomSession));
    } catch (error) {
      next(error);
    }
  },
};
