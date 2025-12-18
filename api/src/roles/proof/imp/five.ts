import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import ProofIF from "../proofIF";
import { Prisma } from "../../../generated/prisma/client";
import { Server } from "socket.io";
import { proofRepository } from "../../../repos/proofRepository";
import { PROOF_RANK, PROOF_STATUS } from "../../../domain/proof/proofCommon";
import { toTProofFromProofList } from "../../../domain/proof/typeParse";
import { ProofList } from "../../../generated/prisma/client";
import { BadRequestError } from "../../../error/AppError";
import { UseSkillResult } from "../../../controllers/proof/dto";
import { z } from "zod";
const paramsSchema = z.object({
  code1: z.string().min(1),
  code2: z.string().min(1),
});
export type ParamsSchema = z.infer<typeof paramsSchema>;
export default class Five implements ProofIF<ParamsSchema> {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("Five executeInitialize");
  }
  async executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server,
    params: ParamsSchema
  ): Promise<UseSkillResult> {
    return {
      isSuccess: true,
      result: "証拠を交換しました",
    };
  }
}
