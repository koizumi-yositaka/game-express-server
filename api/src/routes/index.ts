import { Router } from "express";
import healthRoute from "./health.route";
import roomRoute from "./room.route";
import userRoute from "./user.route";
import roomSessionRoute from "./roomSession.route";

const router = Router();

router.use("/health", healthRoute);
router.use("/rooms", roomRoute);
router.use("/users", userRoute);
router.use("/sessions", roomSessionRoute);
export default router;
