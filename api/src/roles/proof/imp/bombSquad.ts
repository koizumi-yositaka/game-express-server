import ProofIF from "../proofIF";
import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import { Prisma } from "../../../generated/prisma/client";
import { Server } from "socket.io";
import { UseSkillResult } from "../../../controllers/proof/dto";

class BombSquad implements ProofIF<unknown> {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("BombSquad executeInitialize");
    return;
  }
  async executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server,
    params: unknown
  ): Promise<UseSkillResult> {
    console.log("BombSquad executeUseSkill");
    return {
      isSuccess: true,
      result: "BombSquad executeUseSkill",
    };
  }
}

export default BombSquad;
