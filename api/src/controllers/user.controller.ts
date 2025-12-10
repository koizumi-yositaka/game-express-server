import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService";
import z from "zod";
import { DTOUserStatus } from "./dto";

export const registerUserSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
});
export type RegisterUserRequestBody = z.infer<typeof registerUserSchema>;

export const invalidateUserSchema = z.object({
  userId: z.string(),
});
export type InvalidateUserRequestBody = z.infer<typeof invalidateUserSchema>;

export const getUserStatusParamsSchema = z.object({
  userId: z.string(),
});
export type GetUserStatusParams = z.infer<typeof getUserStatusParamsSchema>;

export const userController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id, password } = req.body;
      if (password === "q") {
        res.status(200).json({ result: "ok" });
      } else {
        res.status(200).json({ result: "ng" });
      }
    } catch (error) {
      next(error);
    }
  },
  /**
   * ユーザーを取得する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  getUsers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
  /**
   * ユーザーを登録する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  registerUser: async (
    req: Request<unknown, unknown, RegisterUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    console.log("registerUser", req.body);
    try {
      const user = await userService.registerUser(
        req.body.userId,
        req.body.displayName
      );
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  },
  /**
   * ユーザーを無効化する
   * @param req リクエスト
   * @param res レスポンス
   * @param next 次のミドルウェア
   */
  invalidateUser: async (
    req: Request<InvalidateUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const user = await userService.invalidateUser(req.params.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  },

  getUserStatus: async (
    req: Request<GetUserStatusParams>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userStatus: DTOUserStatus = await userService.getUserStatus(
        req.params.userId
      );
      res.status(200).json(userStatus);
    } catch (error) {
      next(error);
    }
  },
};
