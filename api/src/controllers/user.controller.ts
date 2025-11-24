import { NextFunction, Request, Response } from "express";
import { userService } from "../services/userService";
import z from "zod";

export const registerUserSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
});
export type RegisterUserRequestBody = z.infer<typeof registerUserSchema>;
export const invalidateUserSchema = z.object({
  userId: z.string(),
});
export type InvalidateUserRequestBody = z.infer<typeof invalidateUserSchema>;

export const userController = {
  getUsers: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await userService.getUsers();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  },
  registerUser: async (
    req: Request<unknown, unknown, RegisterUserRequestBody>,
    res: Response,
    next: NextFunction
  ) => {
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
};
