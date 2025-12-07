import { Router } from "express";
import { validate, validateParams } from "../middleware/validation";
import {
  proofController,
  roomCodeParamsSchema,
  roomSessionIdAndProofCodeSchema,
  roomSessionIdSchema,
  revealProofBodySchema,
  createBombBodySchema,
} from "../controllers/proof.controller";
import { addRoomMemberBodySchema } from "../controllers/room.controller";
const router = Router();
router.post("/rooms", proofController.createRoom);
router.get("/rooms", proofController.getAllRooms);
router.get(
  "/rooms/:roomCode",
  validateParams(roomCodeParamsSchema),
  proofController.getRoomByRoomCode
);
router.post(
  "/rooms/:roomCode/close",
  [validateParams(roomCodeParamsSchema)],
  proofController.closeRoom
);
router.post("/rooms/:roomCode/_members", [], proofController._addRoomMembers);
router.post(
  "/rooms/:roomCode/members",
  [validateParams(roomCodeParamsSchema), validate(addRoomMemberBodySchema)],
  proofController.addRoomMember
);
router.post(
  "/rooms/:roomCode/start",
  [validateParams(roomCodeParamsSchema)],
  proofController.startGame
);

router.get(
  "/sessions/:roomSessionId",
  [validateParams(roomSessionIdSchema)],
  proofController.getRoomSessionById
);
router.get("/sessions/", proofController.getRoomSessionByRoomId);
router.post(
  "/sessions/:roomSessionId/reveal/:proofCode",
  [
    validateParams(roomSessionIdAndProofCodeSchema),
    validate(revealProofBodySchema),
  ],
  proofController.getProofByRoomSessionIdAndCode
);
router.post(
  "/sessions/:roomSessionId/bomb",
  [validateParams(roomSessionIdSchema), validate(createBombBodySchema)],
  proofController.createBomb
);
export default router;
