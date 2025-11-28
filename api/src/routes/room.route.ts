import { Router } from "express";
import {
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
router.post("/", roomController.createRoom);
router.get("/", roomController.getAllRooms);
router.get("/:roomCode", roomController.getRoomByRoomCode);
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
