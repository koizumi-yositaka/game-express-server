import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import ProofIF from "../proofIF";
import { Prisma } from "../../../generated/prisma/client";
import { Server } from "socket.io";
import { UseSkillResult } from "../../../controllers/proof/dto";

export default class Strength implements ProofIF<unknown> {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("Strength executeInitialize");
  }
  async executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server,
    params: unknown
  ): Promise<UseSkillResult> {
    console.log("Strength executeUseSkill");
    return {
      isSuccess: true,
      result: "Strength executeUseSkill",
    };
  }
}
