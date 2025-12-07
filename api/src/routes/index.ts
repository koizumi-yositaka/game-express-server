import { Router } from "express";
import healthRoute from "./health.route";
import roomRoute from "./room.route";
import userRoute from "./user.route";
import roomSessionRoute from "./roomSession.route";
import proofRoute from "./proof.route";
const router = Router();

router.use("/health", healthRoute);
router.use("/rooms", roomRoute);
router.use("/users", userRoute);
router.use("/sessions", roomSessionRoute);
router.use("/proofs", proofRoute);
export default router;
