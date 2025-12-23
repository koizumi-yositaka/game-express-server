import { Socket } from "socket.io";
import { Server } from "socket.io";
import { proofService } from "../../services/proofService";
import { toDTOProofRoomSession } from "../../controllers/proof/dtoParse";
export const orderHandler = (io: Server, socket: Socket) => {
  socket.on("order:all", async (sessionRoomId: number) => {
    const roomSession = await proofService.getRoomSession(sessionRoomId);
    if (roomSession) {
      const parsedRoomSession = toDTOProofRoomSession(roomSession);
      io.to(`user:${socket.data.userId}`).emit("order:all", {
        sessionRoom: parsedRoomSession,
      });
    } else {
      io.to(`user:${socket.data.userId}`).emit("order:all", {
        sessionRoom: null,
        error: "Room session not found",
      });
    }
  });
};
