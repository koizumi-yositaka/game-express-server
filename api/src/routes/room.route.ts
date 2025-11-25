import { Router } from "express";
import {
  createRoomSchema,
  roomController,
  closeRoomParamsSchema,
  addRoomMemberBodySchema,
  addRoomMemberParamsSchema,
  getRoomMembersParamsSchema,
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
export default router;
