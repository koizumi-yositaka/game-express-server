import { TCommand, TRoomMember, TRoomSession } from "../domain/types";
import { Prisma } from "../generated/prisma/client";
import { UseSkillResult } from "../controllers/proof/dto";
abstract class RoleIF {
  abstract executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void>;
  abstract executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void>;
}

export default RoleIF;
