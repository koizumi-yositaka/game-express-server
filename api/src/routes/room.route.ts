import { Router } from "express";
import {
  createRoomSchema,
  roomController,
  closeRoomSchema,
} from "../controllers/room.controller";
import { validate, validateParams } from "../middleware/validation";

const router = Router();
router.post("/", validate(createRoomSchema), roomController.createRoom);
router.post(
  "/:code/close",
  validateParams(closeRoomSchema),
  roomController.closeRoom
);
export default router;
