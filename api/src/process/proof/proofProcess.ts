import { Prisma } from "../../generated/prisma/client";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../../error/AppError";
import {
  TProof,
  TProofRoomSession,
  TRevealedResult,
} from "../../domain/proof/types";
import { proofRepository } from "../../repos/proofRepository";
import { toTProofRoomSessionFromProofRoomSessionWithMembers } from "../../domain/proof/typeParse";
import { gameUtil } from "../../util/gameUtil";
import { proofUtil } from "../../util/proofUtil";
import { lineUtil } from "../../util/lineUtil";
import { toTProofFromProofList } from "../../domain/proof/typeParse";
import {
  PROOF_MEMBER_STATUS,
  PROOF_ROOM_STATUS,
  PROOF_ROLE_NAME_MAP,
  PROOF_STATUS,
} from "../../domain/proof/proofCommon";
import { REVEALED_RESULT_CODE } from "../../domain/proof/types";
export const proofProcess = {
  startGame: async (
    tx: Prisma.TransactionClient,
    params: { roomCode: string }
  ): Promise<{ roomSession: TProofRoomSession }> => {
    let room = await proofRepository.getRoomByRoomCode(tx, params.roomCode);
    if (!room || !room.id) {
      throw new NotFoundError("部屋が見つかりません");
    }
    const existingRoomSession = await proofRepository.getRoomSessionByRoomId(
      tx,
      room.id
    );
    if (existingRoomSession) {
      throw new BadRequestError("Room session already exists");
    }
    const roomMembers = await proofRepository.getRoomMembers(tx, room.id);

    const shuffledRoomMembers = gameUtil.shuffleArray(roomMembers);
    let topMemberId = shuffledRoomMembers[0].id;
    for (const [index, member] of shuffledRoomMembers.entries()) {
      await proofRepository.updateRoomMemberSort(
        tx,
        room.id,
        member.userId,
        index
      );
    }
    const roles = await proofRepository.getRoles(tx);
    const initailSetting = await proofUtil.createGameSetting();
    const assignedMembers = proofUtil.assignRoles(roomMembers, roles);
    for (const member of assignedMembers) {
      await proofRepository.updateRoomMemberRole(
        tx,
        room.id,
        member.userId,
        member.roleId
      );
    }
    for (const member of assignedMembers) {
      const { success } = await lineUtil.sendNoticeRoleMessage(
        member.userId,
        member.role?.roleName ?? "",
        member.role?.description ?? "",
        member.role?.imageUrl ?? "",
        member.role?.notionUrl ?? "",
        "役割を確認"
      );
      if (!success) {
        console.error(`Failed to send notice role message to ${member.userId}`);
        throw new InternalServerError("Failed to send notice role message");
      }
    }

    // 初期設定
    // TODO
    //const

    await proofRepository.updateRoom(tx, room.id, {
      status: PROOF_ROOM_STATUS.IN_PROGRESS,
    });
    await proofRepository.createRoomSession(
      tx,
      room.id,
      JSON.stringify(initailSetting),
      topMemberId
    );

    const roomSession = await proofRepository.getRoomSessionByRoomId(
      tx,
      room.id
    );
    if (!roomSession) {
      throw new NotFoundError("Room session 作成失敗");
    }

    // 証拠作成
    // await proofRepository.deleteProofByRoomSessionId(tx, roomSession.id);
    const proofs = await proofUtil.createProofs(initailSetting, roomSession);
    await proofRepository.createProofs(tx, roomSession.id, proofs);

    return {
      roomSession:
        toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession),
    };
  },
  revealProofProcess: async (
    tx: Prisma.TransactionClient,
    params: {
      roomSessionId: number;
      code: string;
      revealedBy: number;
      isEntire: boolean;
    }
  ): Promise<TRevealedResult> => {
    const roomSession = await proofRepository.getRoomSession(
      tx,
      params.roomSessionId
    );
    if (!roomSession) {
      throw new NotFoundError("Room session not found");
    }

    const parsedRoomSession =
      toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession);
    const member = roomSession.room.members.find(
      (member) => member.id === params.revealedBy
    );
    if (!member) {
      throw new NotFoundError("Member not found");
    }

    if (
      member.role.roleName === PROOF_ROLE_NAME_MAP.BOMBER &&
      params.isEntire
    ) {
      throw new BadRequestError("Bomber cannot reveal entire");
    }
    const proof = await proofRepository.getProofByRoomSessionIdAndCode(
      tx,
      params.roomSessionId,
      params.code
    );
    if (!proof) {
      throw new NotFoundError("Proof not found");
    }
    const parsedProof = toTProofFromProofList(proof);

    if (parsedProof.revealedBy.length > 0) {
      console.log(
        "開示済みのカードです",
        parsedProof.revealedBy,
        parsedProof.status
      );
      if (parsedProof.status === PROOF_STATUS.REVEALED_TO_ALL) {
        return {
          result: REVEALED_RESULT_CODE.ALREADY_REVEALED,
          message: "このカードはすでに開示されています",
        };
      }
      if (
        parsedProof.status === PROOF_STATUS.REVEALED_TO_ONE &&
        !params.isEntire &&
        parsedProof.revealedBy.includes(params.revealedBy)
      ) {
        return {
          result: REVEALED_RESULT_CODE.ALREADY_REVEALED,
          message: "このカードはすでにあなたには開示されています",
        };
      }
    }
    // 開示処理
    const newRevealedBy = [...parsedProof.revealedBy, params.revealedBy].join(
      ","
    );
    const updatedProof = await proofRepository.updateProofStatus(
      tx,
      parsedProof.id,
      {
        status: params.isEntire
          ? PROOF_STATUS.REVEALED_TO_ALL
          : PROOF_STATUS.REVEALED_TO_ONE,
        revealedBy: newRevealedBy,
      }
    );
    // 爆弾の場合
    if (proof.status === PROOF_STATUS.BOMBED) {
      // ボマーの場合
      if (member.role.roleName === PROOF_ROLE_NAME_MAP.BOMBER) {
        await proofProcess.revealProcess(tx, {
          roomSession: parsedRoomSession,
          proof: toTProofFromProofList(updatedProof),
          revealedMemberId: member.id,
          revealedMemberUserId: member.user.userId,
          isEntire: params.isEntire,
        });
        return {
          result: REVEALED_RESULT_CODE.SUCCESS,
          message: "このカードは開示されました",
          proof: toTProofFromProofList(updatedProof),
        };
      }
      // 鑑定士の場合
      // 全体開示でない場合のみ解除可能
      if (
        member.role.roleName === PROOF_ROLE_NAME_MAP.BOMB_SQUAD &&
        !params.isEntire
      ) {
        await proofProcess.revealProcess(tx, {
          roomSession: parsedRoomSession,
          proof: toTProofFromProofList(updatedProof),
          revealedMemberId: member.id,
          revealedMemberUserId: member.user.userId,
          isEntire: params.isEntire,
        });
        return {
          result: REVEALED_RESULT_CODE.DISARM_SUCCESS,
          message: "爆弾を解除しました",
          proof: toTProofFromProofList(updatedProof),
        };
      }
      // 爆発時の処理
      await proofProcess.bombedProcess(tx, {
        roomSession: parsedRoomSession,
        userId: member.userId,
        isEntire: params.isEntire,
      });
      return {
        result: REVEALED_RESULT_CODE.BOMBED,
        message: "このカードは爆弾です",
      };
    }
    await proofProcess.revealProcess(tx, {
      roomSession: parsedRoomSession,
      proof: toTProofFromProofList(updatedProof),
      revealedMemberId: member.id,
      revealedMemberUserId: member.user.userId,
      isEntire: params.isEntire,
    });
    return {
      result: REVEALED_RESULT_CODE.SUCCESS,
      message: "このカードは開示されました",
      proof: toTProofFromProofList(updatedProof),
    };
  },
  revealProcess: async (
    tx: Prisma.TransactionClient,
    params: {
      roomSession: TProofRoomSession;
      proof: TProof;
      revealedMemberId: number;
      revealedMemberUserId: string;
      isEntire: boolean;
    }
  ): Promise<void> => {
    const proofInfo = params.proof.title + params.proof.description;
    if (params.isEntire) {
      for (const member of params.roomSession.room.members) {
        await lineUtil.sendSimpleTextMessage(member.userId, proofInfo);
      }
    } else {
      await lineUtil.sendSimpleTextMessage(
        params.revealedMemberUserId,
        proofInfo
      );
    }
  },
  bombedProcess: async (
    tx: Prisma.TransactionClient,
    params: {
      roomSession: TProofRoomSession;
      userId: string;
      isEntire: boolean;
    }
  ): Promise<void> => {
    if (params.isEntire) {
      for (const member of params.roomSession.room.members) {
        if (member.role?.roleName !== PROOF_ROLE_NAME_MAP.BOMBER) {
          await lineUtil.sendSimpleTextMessage(
            member.userId,
            "爆死です。ボマーの勝利です"
          );
          await proofRepository.updateRoomMemberStatus(
            tx,
            params.roomSession.room.id,
            member.userId,
            PROOF_MEMBER_STATUS.BOMBED
          );
        } else {
          await lineUtil.sendSimpleTextMessage(
            member.userId,
            "ボマーの勝利です"
          );
        }
      }
      // ゲーム完了
    } else {
      await lineUtil.sendSimpleTextMessage(params.userId, "爆死です");
      await proofRepository.updateRoomMemberStatus(
        tx,
        params.roomSession.room.id,
        params.userId,
        PROOF_MEMBER_STATUS.BOMBED
      );
    }
  },
};
