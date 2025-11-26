import { Router } from "express";
import {
  createRoomSchema,
  roomController,
  closeRoomParamsSchema,
  addRoomMemberBodySchema,
  addRoomMemberParamsSchema,
  getRoomMembersParamsSchema,
  getRoomMemberParamsSchema,
  startGameParamsSchema,
} from "../controllers/room.controller";
import { validate, validateParams } from "../middleware/validation";

const router = Router();
router.post("/", validate(createRoomSchema), roomController.createRoom);
router.post(
  "/:roomCode/close",
  validateParams(closeRoomParamsSchema),
  roomController.closeRoom
);
router.post(
  "/:roomCode/members",
  [
    validateParams(addRoomMemberParamsSchema),
    validate(addRoomMemberBodySchema),
  ],
  roomController.addRoomMember
);
router.get(
  "/:roomCode/members",
  validateParams(getRoomMembersParamsSchema),
  roomController.getRoomMembers
);
router.get(
  "/:roomCode/members/:userId",
  validateParams(getRoomMemberParamsSchema),
  roomController.getRoomMember
);
router.post(
  "/:roomCode/start",
  validateParams(startGameParamsSchema),
  roomController.startGame
);
export default router;
