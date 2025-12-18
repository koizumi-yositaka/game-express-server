import { Prisma } from "../../generated/prisma/client";
import {
  NotFoundError,
  BadRequestError,
  InternalServerError,
} from "../../error/AppError";
import {
  TProof,
  TProofRoomMember,
  TProofRoomSession,
  TRevealedResult,
} from "../../domain/proof/types";
import { proofRepository } from "../../repos/proofRepository";
import {
  toTProofRoomMember,
  toTProofRoomMemberFromProofRoomMemberWithUsers,
  toTProofRoomSessionFromProofRoomSessionWithMembers,
} from "../../domain/proof/typeParse";
import { gameUtil } from "../../util/gameUtil";
import { createRefer, proofUtil } from "../../util/proofUtil";
import { lineUtil } from "../../util/lineUtil";
import { toTProofFromProofList } from "../../domain/proof/typeParse";
import {
  PROOF_MEMBER_STATUS,
  PROOF_ROOM_STATUS,
  PROOF_ROLE_NAME_MAP,
  PROOF_STATUS,
  PROOF_ADMIN_USER_ID,
  PROOF_RANK,
  PROOF_PENALTY_MAP,
} from "../../domain/proof/proofCommon";
import { REVEALED_RESULT_CODE } from "../../domain/proof/types";
import { Server } from "socket.io";
import { proofSpecialMoveExecutor } from "../../roles/proof/roleSpecialMoveExecutor";
import { RequestReportResult } from "../../controllers/proof/dto";

const FRONT_URL = process.env.FRONT_URL ?? "http://localhost:5173";
export const proofProcess = {
  startGame: async (
    tx: Prisma.TransactionClient,
    params: { roomCode: string }
  ): Promise<{ roomSession: TProofRoomSession }> => {
    let room = await proofRepository.getRoomByRoomCode(tx, params.roomCode);
    if (!room || !room.id) {
      throw new NotFoundError("部屋が見つかりません");
    }
    await proofRepository.getRoomSessionByRoomId(tx, room.id);
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
    const roles = (await proofRepository.getRoles(tx)).filter(
      (role) => role.roleName !== "NONE"
    );
    const initailSetting = await proofUtil.createGameSetting(
      roomMembers.length
    );
    const assignedMembers = proofUtil.assignRoles(
      roomMembers.map(toTProofRoomMember),
      roles
    );
    for (const member of assignedMembers) {
      await proofRepository.updateRoomMemberRole(
        tx,
        room.id,
        member.userId,
        member.roleId
      );
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

    if (roomSession.room.members.some((member) => !member.role)) {
      throw new BadRequestError("Role not assigned");
    }

    // 証拠作成
    await proofRepository.deleteProofByRoomSessionId(tx, room.id);

    const proofs = await proofUtil.createProofs(
      initailSetting,
      toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession),
      roles
    );
    await proofRepository.createProofs(tx, roomSession.id, proofs);

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
    for (const member of roomSession.room.members.map(
      toTProofRoomMemberFromProofRoomMemberWithUsers
    )) {
      if (!member.role) {
        throw new BadRequestError("Role not assigned");
      }
      if (!member.user) {
        throw new BadRequestError("User not assigned");
      }
      const token = await proofUtil.createToken({
        roomSessionId: roomSession.id,
        memberId: member.id,
        roleName: member.role.roleName as keyof typeof PROOF_ROLE_NAME_MAP,
        status: PROOF_MEMBER_STATUS.ENTERED,
        displayName: member.user.displayName,
        userId: member.user.userId,
        roomCode: room.roomCode,
      });
      lineUtil.sendSimpleTextMessage(
        member.userId,
        `${FRONT_URL}?token=${token}`
      );
    }

    return {
      roomSession:
        toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession),
    };
  },
  turnIntoBombProcess: async (
    tx: Prisma.TransactionClient,
    params: {
      roomSessionId: number;
      memberId: number;
      proofCode: string;

      isRevealedMyMe?: boolean;
    }
  ): Promise<void> => {
    const proof = await proofRepository.getProofByRoomSessionIdAndCode(
      tx,
      params.roomSessionId,
      params.proofCode
    );
    console.log("turnIntoBombProcess", proof);
    if (!proof) {
      throw new NotFoundError("Proof not found");
    }

    if (proof.status === PROOF_STATUS.REVEALED_TO_ALL) {
      throw new BadRequestError("Proof is already revealed to all");
    }
    // if (params.isOnlyA && proof.rank !== PROOF_RANK.A) {
    //   throw new BadRequestError("Bomber can only turn into bomb A");
    // }
    // if (
    //   params.isOnlyPrivateRevealed &&
    //   proof.status !== PROOF_STATUS.REVEALED_TO_ONE
    // ) {
    //   throw new BadRequestError("Proof is not revealed to one");
    // }
    if (
      params.isRevealedMyMe &&
      !proof.revealedBy.includes(params.memberId.toString())
    ) {
      throw new BadRequestError("自分が開示した証拠でないと爆弾にできません");
    }
    if (proof.bomFlg) {
      throw new BadRequestError("Proof is already a bomb");
    }
    await proofRepository.updateProofStatus(tx, proof.id, { bomFlg: true });
  },

  revealProofProcess: async (
    tx: Prisma.TransactionClient,
    io: Server,
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
        // 爆弾をPrivate開示の場合は爆弾のまま
        status: params.isEntire
          ? PROOF_STATUS.REVEALED_TO_ALL
          : PROOF_STATUS.REVEALED_TO_ONE,
        revealedBy: newRevealedBy,
        revealedTurn: parsedRoomSession.turn,
      }
    );
    // 爆弾の場合
    if (parsedProof.bomFlg) {
      // ボマーの場合
      if (member.role.roleName === PROOF_ROLE_NAME_MAP.BOMBER) {
        await proofProcess.revealProcess(tx, io, {
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
        await proofProcess.revealProcess(tx, io, {
          roomSession: parsedRoomSession,
          proof: toTProofFromProofList(updatedProof),
          revealedMemberId: member.id,
          revealedMemberUserId: member.user.userId,
          isEntire: params.isEntire,
        });
        // 一応鑑定士のスキルも実行処理を投げておく
        await proofSpecialMoveExecutor.executeUseSkill(
          PROOF_ROLE_NAME_MAP.BOMB_SQUAD,
          tx,
          toTProofRoomMember(member),
          parsedRoomSession,
          io,
          params
        );
        return {
          result: REVEALED_RESULT_CODE.DISARM_SUCCESS,
          message: "爆弾を解除しました",
          proof: toTProofFromProofList(updatedProof),
        };
      }
      // 爆発時の処理
      await proofProcess.bombedProcess(tx, io, {
        roomSession: parsedRoomSession,
        userId: member.userId,
        isEntire: params.isEntire,
      });
      return {
        result: REVEALED_RESULT_CODE.BOMBED,
        message: "このカードは爆弾です",
      };
    }
    await proofProcess.revealProcess(tx, io, {
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
    io: Server,
    params: {
      roomSession: TProofRoomSession;
      proof: TProof;
      revealedMemberId: number;
      revealedMemberUserId: string;
      isEntire: boolean;
    }
  ): Promise<void> => {
    const proofInfo = params.proof.title + params.proof.description;

    const revealedByMember = params.roomSession.room.members.find(
      (member) => member.userId === params.revealedMemberUserId
    );
    if (!revealedByMember) {
      throw new NotFoundError("Member not found");
    }
    const message = `${
      revealedByMember.user?.displayName ?? "someone"
    }がカード「${params.proof.rank}${params.proof.code}」を開示しました`;
    if (params.isEntire) {
      for (const member of params.roomSession.room.members) {
        await lineUtil.sendSimpleTextMessage(member.userId, proofInfo);
      }
      io.to(`user:${PROOF_ADMIN_USER_ID}`).emit("proof:revealResult", {
        result: REVEALED_RESULT_CODE.SUCCESS,
        message: message,
        proof: params.proof,
      });
    } else {
      await lineUtil.sendSimpleTextMessage(
        params.revealedMemberUserId,
        proofInfo
      );
    }
  },
  bombedProcess: async (
    tx: Prisma.TransactionClient,
    io: Server,
    params: {
      roomSession: TProofRoomSession;
      userId: string;
      isEntire: boolean;
    }
  ): Promise<void> => {
    if (params.isEntire) {
      io.to(`user:${PROOF_ADMIN_USER_ID}`).emit("proof:revealResult", {
        result: REVEALED_RESULT_CODE.BOMBED,
        message: "このカードは爆弾です",
      });
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
            PROOF_MEMBER_STATUS.RETIRED
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
        PROOF_MEMBER_STATUS.RETIRED
      );
    }
  },
  useSkill: async (
    tx: Prisma.TransactionClient,
    io: Server,
    params: {}
  ): Promise<void> => {},
  report: async (
    tx: Prisma.TransactionClient,
    io: Server,
    params: {
      roomSession: TProofRoomSession;
      member: TProofRoomMember;
      targetMember: TProofRoomMember;
      proofCodes: string[];
    }
  ): Promise<RequestReportResult> => {
    const proofList: TProof[] = [];
    for (const proofCode of params.proofCodes) {
      const proof = await proofRepository.getProofByRoomSessionIdAndCode(
        tx,
        params.roomSession.id,
        proofCode
      );
      if (proof) {
        proofList.push(toTProofFromProofList(proof));
      } else {
        return {
          isSuccess: false,
          message: "証拠が見つかりません",
          ngList: [{ proofCode: proofCode, message: "証拠が見つかりません" }],
        };
      }
    }
    const ngList = proofList
      .map((proof) => {
        if (proof.status !== PROOF_STATUS.REVEALED_TO_ALL) {
          return {
            proofCode: proof.code,
            message: "全体に開示されていません",
          };
        }
        if (
          proof.refer !== createRefer("member", params.member.id.toString())
        ) {
          return {
            proofCode: proof.code,
            message: `${params.member.user?.displayName}の証拠ではありません`,
          };
        }
        return null;
      })
      .filter((ng) => ng !== null);
    if (ngList.length > 0) {
      return {
        isSuccess: false,
        message: "告発に失敗しました",
        ngList: ngList,
      };
    }
    const hasPenalty =
      params.targetMember.penalty?.length > 0 &&
      params.targetMember.penalty?.includes(PROOF_PENALTY_MAP.LIE);
    if (
      proofList.filter((proof) => proof.rank === PROOF_RANK.A).length >= 1 ||
      proofList.filter((proof) => proof.rank === PROOF_RANK.B).length >=
        (hasPenalty ? 1 : 2)
    ) {
      // 告発に成功
      await proofProcess.deathProcess(tx, io, {
        roomSession: params.roomSession,
        member: params.targetMember,
      });
      return {
        isSuccess: true,
        message: "告発に成功しました",
        ngList: [],
      };
    } else {
      return {
        isSuccess: false,
        message: "告発に必要な証拠には不十分でした",
        ngList: ngList,
      };
    }
  },

  deathProcess: async (
    tx: Prisma.TransactionClient,
    io: Server,
    params: {
      roomSession: TProofRoomSession;
      member: TProofRoomMember;
    }
  ): Promise<void> => {
    if (
      params.member.role?.roleName === PROOF_ROLE_NAME_MAP.STRENGTH &&
      params.member.skillUsedTime === 0
    ) {
      // 回避
      proofSpecialMoveExecutor.executeUseSkill(
        PROOF_ROLE_NAME_MAP.STRENGTH,
        tx,
        params.member,
        params.roomSession,
        io,
        params
      );
      return;
    }
    proofRepository.updateRoomMemberStatus(
      tx,
      params.roomSession.room.id,
      params.member.userId,
      PROOF_MEMBER_STATUS.RETIRED
    );
  },
};
