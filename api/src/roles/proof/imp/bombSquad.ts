import ProofIF from "../proofIF";
import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import { Prisma } from "../../../generated/prisma/client";

class BombSquad implements ProofIF {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("BombSquad executeInitialize");
    return;
  }
}

export default BombSquad;
