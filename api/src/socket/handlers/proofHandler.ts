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
export const proofHandler = (io: Server, socket: Socket) => {
  socket.on("proof:init", async (roomSessionId, memberId) => {
    let currentInfo: ExtendedUserInfo | null = null;
    try {
      const roomSession = await proofService.getRoomSession(roomSessionId);
      const member = roomSession.room.members.find(
        (member) => member.id === memberId
      );
      if (!member) {
        throw new NotFoundError("Member not found");
      }
      currentInfo = {
        userId: member.userId,
        roomSessionId: roomSession.id,
        roomCode: roomSession.room.roomCode,
        displayName: member.user?.displayName ?? "",
        memberId: member.id,
        roleName: member.role?.roleName as keyof typeof PROOF_ROLE_NAME_MAP,
        status:
          member.status as (typeof PROOF_MEMBER_STATUS)[keyof typeof PROOF_MEMBER_STATUS],
        isFocusing: roomSession.focusOn === memberId,
      };
      io.to(`user:${socket.data.userId}`).emit("proof:init", {
        me: currentInfo,
      });
    } catch (error) {
      console.error("proof:init error:", error);
      io.to(`user:${socket.data.userId}`).emit("proof:init", null);
    }
  });
};
