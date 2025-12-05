import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { Prisma } from "../../generated/prisma/client";
class Fool implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Fool executeSpecialMove");
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
