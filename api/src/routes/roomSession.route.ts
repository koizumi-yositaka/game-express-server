import { Router } from "express";
import {
  validate,
  validateParams,
  validateQuery,
} from "../middleware/validation";
import {
  roomSessionIdSchema,
  roomIdSchema,
  roomSessionController,
  addCommandsBodySchema,
  gameCompleteBodySchema,
} from "../controllers/roomSession.controller";

const router = Router();
router.get(
  "/",
  validateQuery(roomIdSchema),
  roomSessionController.getRoomSessionByRoomId
);
router.get(
  "/:roomSessionId",
  validateParams(roomSessionIdSchema),
  roomSessionController.getRoomSessionById
);
router.post(
  "/:roomSessionId/step",
  validateParams(roomSessionIdSchema),
  roomSessionController.stepRoomSession
);
router.post(
  "/:roomSessionId/startTurn",
  validateParams(roomSessionIdSchema),
  roomSessionController.startTurn
);
router.post(
  "/:roomSessionId/commands",
  validate(addCommandsBodySchema),
  roomSessionController.addCommands
);
router.get(
  "/:roomSessionId/commandHistory",
  validateParams(roomSessionIdSchema),
  roomSessionController.getCommandHistory
);
router.post(
  "/:roomSessionId/complete",
  validate(gameCompleteBodySchema),
  roomSessionController.gameComplete
);
// router.post(
//   "/create/:roomId",
//   validateParams(roomIdSchema),
//   roomSessionController.createRoomSession
// );
export default router;
