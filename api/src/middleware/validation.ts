// middlewares/validate.ts
import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validate =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.body);
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.errors,
      });
    }
  };

export const validateParams =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log(req.params);
      schema.parse(req.params);
      console.log("afetr");
      next();
    } catch (err: any) {
      return res.status(400).json({
        message: "Invalid path parameters",
        errors: err.errors,
      });
    }
  };
