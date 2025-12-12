import { Router } from "express";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  proofController,
  roomCodeParamsSchema,
  roomSessionIdAndProofCodeSchema,
  roomSessionIdSchema,
  revealProofBodySchema,
  createBombBodySchema,
  addRoomMemberBodySchema,
  tokenBodySchema,
  memberIdSchema,
  optionalMemberIdParamsSchema,
  judgeAlreadyRevealedBodySchema,
  roomSessionIdAndMemberIdSchema,
} from "../controllers/proof.controller";

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
router.get(
  "/sessions/:roomSessionId/proofList",
  [
    validateParams(roomSessionIdSchema),
    validateQuery(optionalMemberIdParamsSchema),
  ],
  proofController.getProofList
);
router.get(
  "/sessions/:roomSessionId/status/:proofCode",
  [
    validateParams(roomSessionIdAndProofCodeSchema),
    validateQuery(memberIdSchema),
  ],
  proofController.getProofStatus
);
router.post(
  "/sessions/:roomSessionId/reveal/:proofCode",
  [
    validateParams(roomSessionIdAndProofCodeSchema),
    validate(revealProofBodySchema),
  ],
  proofController.getProofByRoomSessionIdAndCode
);
router.post(
  "/sessions/:roomSessionId/bombInit",
  [validateParams(roomSessionIdSchema), validate(createBombBodySchema)],
  proofController.initializeBomb
);
router.post(
  "/sessions/:roomSessionId/bomb",
  [validateParams(roomSessionIdSchema), validate(createBombBodySchema)],
  proofController.initializeBomb
);

router.post(
  "/sessions/:roomSessionId/turn/start",
  [validateParams(roomSessionIdSchema)],
  proofController.startTurn
);

router.post(
  "/sessions/:roomSessionId/order/start",
  [validateParams(roomSessionIdSchema)],
  proofController.startOrder
);

router.post(
  "/sessions/:roomSessionId/order/end",
  [validateParams(roomSessionIdSchema)],
  proofController.endOrder
);

router.post("/sessions/_forceFocus", proofController._forceFocus);

router.post("/token", [validate(tokenBodySchema)], proofController.decodeToken);
router.post(
  "/judgeAlreadyRevealed",
  [validate(judgeAlreadyRevealedBodySchema)],
  proofController.judgeAlreadyRevealed
);
router.get(
  "/sessions/:roomSessionId/roleSetting/:memberId",
  [validateParams(roomSessionIdAndMemberIdSchema)],
  proofController.getRoleSetting
);
export default router;
