import { Socket } from "socket.io";
import { ChatMessage, ExtendedUserInfo } from "../socketTypes";
import { Server } from "socket.io";
import { proofService } from "../../services/proofService";
import { TProofRoomSession } from "../../domain/proof/types";
import { NotFoundError } from "../../error/AppError";
import {
  PROOF_MEMBER_STATUS,
  PROOF_ROLE_NAME_MAP,
} from "../../domain/proof/proofCommon";
import { DTOProofRoomSession } from "../../controllers/proof/dto";
export const orderHandler = (io: Server, socket: Socket) => {
  socket.on("order:all", async (sessionRoomId: number) => {
    console.log("order:all", sessionRoomId);
    const roomSession = await proofService.getRoomSession(sessionRoomId);
    if (roomSession) {
      io.to(`user:${socket.data.userId}`).emit("order:all", {
        sessionRoom: roomSession,
      });
    } else {
      io.to(`user:${socket.data.userId}`).emit("order:all", {
        sessionRoom: null,
        error: "Room session not found",
      });
    }
  });
};
