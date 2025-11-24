import { NextFunction, Request, Response } from "express";

export const healthController = {
  getHealth: (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({ message: "ok" });
  },
};
