import { TProofRoomMember, TProofRoomSession } from "../../domain/proof/types";
import { Prisma } from "../../generated/prisma/client";
import { Server } from "socket.io";
abstract class ProofIF {
  abstract executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void>;
  abstract executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server
  ): Promise<void>;
}

export default ProofIF;
