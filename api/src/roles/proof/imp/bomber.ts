import ProofIF from "../proofIF";
import {
  TProofRoomMember,
  TProofRoomSession,
} from "../../../domain/proof/types";
import { Prisma } from "../../../generated/prisma/client";
import { proofRepository } from "../../../repos/proofRepository";
import {
  PROOF_BOMB_RESERVED_WORD,
  PROOF_RANK,
  PROOF_STATUS,
} from "../../../domain/proof/proofCommon";
import { myUtil } from "../../../util/myUtil";
import { NotFoundError } from "../../../error/AppError";
import { Server } from "socket.io";

class Bomber implements ProofIF {
  async executeInitialize(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> {
    console.log("Bomber executeInitialize");

    const proofRankAList = (
      await proofRepository.getProofsByRoomSessionId(tx, roomSession.id)
    ).filter(
      (proof) =>
        proof.rank === PROOF_RANK.A && proof.status === PROOF_STATUS.NORMAL
    );

    const randomIndex = myUtil.getRandomInt(0, proofCodes.length - 1);
    const randomProofCode = proofCodes[randomIndex];

    for (const proofCode of proofCodes) {
      const proof = await proofRepository.getProofByRoomSessionIdAndCode(
        tx,
        roomSession.id,
        proofCode
      );
      if (!proof) {
        throw new NotFoundError("Proof not found");
      }
      // ボマーが爆弾のヒントを持っている場合、他のカードと交換する
      if (
        proof.rank === PROOF_RANK.A &&
        proof.title === PROOF_BOMB_RESERVED_WORD
      ) {
        const rankAExcludeThisARankCardList = proofRankAList.filter(
          (proof) => proof.code !== proofCode
        );
        const randomIndex = myUtil.getRandomInt(
          0,
          rankAExcludeThisARankCardList.length - 1
        );
        const exchangeProof = rankAExcludeThisARankCardList[randomIndex];
        console.log(proof.id + "と" + exchangeProof.id + "を交換");
        await proofRepository.updateProofStatus(tx, proof.id, {
          title: exchangeProof.title,
          description: exchangeProof.description,
        });
        await proofRepository.updateProofStatus(tx, exchangeProof.id, {
          title: "爆弾のヒント",
          description: `${randomProofCode}は爆弾です`,
        });
      }
      await proofRepository.updateProofStatus(tx, proof.id, {});
    }

    const bombProof = proofRankAList.find(
      (proof) => proof.title === PROOF_BOMB_RESERVED_WORD
    );

    if (bombProof) {
      await proofRepository.updateProofStatus(tx, bombProof.id, {
        title: "爆弾のヒント",
        description: `${randomProofCode}は爆弾です`,
      });
    }
  }
  async executeUseSkill(
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server
  ): Promise<void> {
    console.log("Bomber executeUseSkill");
  }
}

export default Bomber;
