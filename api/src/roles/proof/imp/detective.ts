import ProofIF from "../proofIF";
import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import { Prisma } from "../../../generated/prisma/client";

class Detective implements ProofIF {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("Detective executeInitialize");
    return;
  }
}

export default Detective;
