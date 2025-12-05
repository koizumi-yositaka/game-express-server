import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { Prisma } from "../../generated/prisma/client";
class Tower implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Tower executeSpecialMove");
  }
  async executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Tower executeInitialize");
    return;
  }
}

export default Tower;
