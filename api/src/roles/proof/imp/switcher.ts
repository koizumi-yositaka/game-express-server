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
  code1: z.string().min(1).max(3),
  code2: z.string().min(1).max(3),
});
export type ParamsSchema = z.infer<typeof paramsSchema>;
export default class Switcher implements ProofIF<ParamsSchema> {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("Strength executeInitia ize");
  }
  async executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server,
    params: ParamsSchema
  ): Promise<UseSkillResult> {
    let code1 = "";
    let code2 = "";

    try {
      params = paramsSchema.parse(params);
      code1 = params.code1;
      code2 = params.code2;
    } catch (error) {
      throw new BadRequestError("Invalid params");
    }
    if (code1 === code2) {
      return {
        isSuccess: false,
        result: "証拠コードが同じです",
      };
    }
    const target1 = await proofRepository.getProofByRoomSessionIdAndCode(
      tx,
      roomSession.id,
      code1
    );
    const target2 = await proofRepository.getProofByRoomSessionIdAndCode(
      tx,
      roomSession.id,
      code2
    );
    const validate = (code: string, proof: ProofList | null): string => {
      if (!proof) {
        return `${code}は存在しません`;
      }
      if (proof?.status === PROOF_STATUS.REVEALED_TO_ALL) {
        return `${code}は全体に開示されています`;
      }
      if (proof?.rank !== PROOF_RANK.A) {
        return `${code}はAランクではありません`;
      }
      return "";
    };

    const message1 = validate(code1, target1);
    const message2 = validate(code2, target2);
    if (message1 !== "" || message2 !== "") {
      return {
        isSuccess: false,
        result: message1 + message2,
      };
    }

    const parsedTarget1 = toTProofFromProofList(target1!);
    const parsedTarget2 = toTProofFromProofList(target2!);
    await proofRepository.updateProofStatus(tx, parsedTarget1.id, {
      status: PROOF_STATUS.REVEALED_TO_ONE,
      title: parsedTarget2.title,
      description: parsedTarget2.description,
      refer: parsedTarget2.refer,
      revealedTurn: parsedTarget2.revealedTurn,
      bomFlg: parsedTarget2.bomFlg,
    });
    await proofRepository.updateProofStatus(tx, parsedTarget2.id, {
      status: PROOF_STATUS.REVEALED_TO_ONE,
      title: parsedTarget1.title,
      description: parsedTarget1.description,
      refer: parsedTarget1.refer,
      revealedTurn: parsedTarget1.revealedTurn,
      bomFlg: parsedTarget1.bomFlg,
    });
    return {
      isSuccess: true,
      result: "証拠を交換しました",
    };
  }
}
