import { Router } from "express";
import { validate, validateParams } from "../middleware/validation";
import {
  registerUserSchema,
  userController,
  invalidateUserSchema,
  getUserStatusParamsSchema,
} from "../controllers/user.controller";

const router = Router();
router.post("/", validate(registerUserSchema), userController.registerUser);
router.post("/login", userController.login);
router.post(
  "/:userId/invalidate",
  validateParams(invalidateUserSchema),
  userController.invalidateUser
);
router.get(
  "/:userId/status",
  validateParams(getUserStatusParamsSchema),
  userController.getUserStatus
);
export default router;
