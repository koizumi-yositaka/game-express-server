import { TProofRoomMember, TProofRoomSession } from "../../domain/proof/types";
import { Prisma } from "../../generated/prisma/client";
abstract class ProofIF {
  abstract executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void>;
}

export default ProofIF;
