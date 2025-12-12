import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import ProofIF from "../proofIF";
import { Prisma } from "../../../generated/prisma/client";
import { Server } from "socket.io";

export default class Strength implements ProofIF {
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
    io: Server
  ): Promise<void> {
    console.log("Strength executeUseSkill");
  }
}
