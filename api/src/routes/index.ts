import { Router } from "express";
import healthRoute from "./health.route";
import roomRoute from "./room.route";
import userRoute from "./user.route";

const router = Router();

router.use("/health", healthRoute);
router.use("/rooms", roomRoute);
router.use("/users", userRoute);

export default router;
