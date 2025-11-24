import { Router } from "express";
import { validate, validateParams } from "../middleware/validation";
import {
  registerUserSchema,
  userController,
  invalidateUserSchema,
} from "../controllers/user.controller";

const router = Router();
router.post("/", validate(registerUserSchema), userController.registerUser);
router.post(
  "/:userId/invalidate",
  validateParams(invalidateUserSchema),
  userController.invalidateUser
);
export default router;
