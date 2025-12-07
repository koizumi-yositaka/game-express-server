import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { Prisma } from "../../generated/prisma/client";
import { GAME_STATUS } from "../../domain/common";
import { roomSessionRepository } from "../../repos/roomSessionRepository";
class Fool implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Fool executeSpecialMove");
    await roomSessionRepository.updateRoomSessionStatus(
      tx,
      roomSession.id,
      GAME_STATUS.FOOL_SKILL_USED
    );
  }
  async executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Fool executeInitialize");
    return;
  }
}

export default Fool;
