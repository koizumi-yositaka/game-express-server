import { prisma } from "../db/prisma";
import { proofRepository, ProofRoomWithUsers } from "../repos/proofRepository";
import { Prisma } from "../generated/prisma/client";
import { randomInt } from "crypto";
import {
  BadRequestError,
  InternalServerError,
  NotFoundError,
} from "../error/AppError";
import {
  toTProofRoom,
  toTProofRoomFromProofRoomWithUsers,
  toTProofRoomSessionFromProofRoomSessionWithMembers,
  toTProofRoomSession,
  toTProofFromProofList,
  toTProofRoomMember,
  toTProofRoomMemberFromProofRoomMemberWithUsers,
} from "../domain/proof/typeParse";
import { RequestReportResult, UseSkillResult } from "../controllers/proof/dto";
import {
  TProof,
  TProofRoom,
  TProofRoomSession,
  TRevealedResult,
  RoleFeatureB,
  ProofRoomSessionSettingJsonContents,
  TProofRoomMember,
  RoleSkillDef,
} from "../domain/proof/types";
import { lineUtil } from "../util/lineUtil";
import { userRepository } from "../repos/userRepository";
import {
  PROOF_ROOM_SESSION_STATUS,
  PROOF_ROOM_STATUS,
} from "../domain/proof/proofCommon";
import { proofProcess } from "../process/proof/proofProcess";
import {
  PROOF_BOMB_RESERVED_WORD,
  PROOF_RANK,
  PROOF_STATUS,
  PROOF_MEMBER_STATUS,
  PROOF_ROLE_NAME_MAP,
  PROOF_PENALTY_MAP,
} from "../domain/proof/proofCommon";
import { myUtil } from "../util/myUtil";
import { proofSpecialMoveExecutor } from "../roles/proof/roleSpecialMoveExecutor";
import { roomSessionService } from "./roomSessionService";
import { Server } from "socket.io";
import {
  activateUser,
  createRefer,
  isBomber,
  noticeAllUserInfo,
} from "../util/proofUtil";

const ATTEMPTS_LIMIT = 5;
export const proofService = {
  createProofRoom: async () => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let attempts = 0;
      let roomCode = "";
      while (attempts < ATTEMPTS_LIMIT) {
        roomCode = generate4DigitCode();
        let room = await proofRepository.getRoomByRoomCode(tx, roomCode);
        // roomIdが存在しない場合はこのroomCodeを使う
        if (!room) {
          const createdRoom = await proofRepository.createRoom(tx, roomCode);
          if (!createdRoom) {
            throw new InternalServerError("Failed to create room");
          }
          return toTProofRoom(createdRoom, []);
        } else if (room && !room.openFlg) {
          const reopenedRoom = await proofRepository.updateRoom(tx, room.id, {
            openFlg: true,
          });
          if (!reopenedRoom) {
            throw new InternalServerError("Failed to reopen room");
          }
          return toTProofRoom(reopenedRoom, []);
        }
        attempts++;
      }
      throw new InternalServerError("Failed to create room");
    });
  },

  closeRoom: async (roomCode: string): Promise<TProofRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room: ProofRoomWithUsers | null =
        await proofRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (!room.openFlg) {
        throw new BadRequestError("Room is already closed");
      }
      const closedRoom = await proofRepository.updateRoom(tx, room.id, {
        openFlg: false,
      });
      if (!closedRoom) {
        throw new InternalServerError("Failed to close room");
      }
      const roomSession = await proofRepository.getRoomSessionByRoomId(
        tx,
        closedRoom.id
      );

      if (roomSession) {
        for (const member of roomSession.room.members) {
          lineUtil.sendSimpleTextMessage(
            member.userId,
            `ROOM[${closedRoom.roomCode}] CLOSED`
          );
        }
      }
      return toTProofRoom(closedRoom, []);
    });
  },
  updateRoomStatus: async (
    roomCode: string,
    status: number
  ): Promise<TProofRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let room: ProofRoomWithUsers | null =
        await proofRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      const updatedRoom = await proofRepository.updateRoom(tx, room.id, {
        status,
      });
      if (!updatedRoom) {
        throw new InternalServerError("Failed to update room status");
      }
      return toTProofRoom(updatedRoom, room.members);
    });
  },
  getAllRooms: async (): Promise<TProofRoom[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const rooms: ProofRoomWithUsers[] = await proofRepository.getRooms(
        tx,
        {}
      );
      return rooms.map((room) => toTProofRoomFromProofRoomWithUsers(room));
    });
  },
  getRoomInfoByRoomCode: async (roomCode: string): Promise<TProofRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room: ProofRoomWithUsers | null =
        await proofRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return toTProofRoomFromProofRoomWithUsers(room);
    });
  },
  getRoomByRoomCode: async (roomCode: string): Promise<TProofRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room: ProofRoomWithUsers | null =
        await proofRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      return toTProofRoomFromProofRoomWithUsers(room);
    });
  },

  joinRoom: async (roomCode: string, userId: string): Promise<TProofRoom> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const room = await proofRepository.getRoomByRoomCode(tx, roomCode);
      if (!room) {
        throw new NotFoundError("部屋が見つかりません");
      }
      if (room.status !== PROOF_ROOM_STATUS.NOT_STARTED) {
        throw new BadRequestError("Roomは募集中ではありません");
      }
      const memberInfo = await userRepository.getUser(tx, userId);
      if (!memberInfo) {
        throw new NotFoundError("ユーザーが見つかりません");
      }
      const roomMembers = await proofRepository.getRoomMembers(tx, room.id);
      if (!roomMembers.some((member) => member.userId === userId)) {
        await proofRepository.joinRoom(tx, room.id, userId);
      }
      // あらたしくメンバー状況を取得するかは未定
      return toTProofRoom(room, []);
    });
  },

  startGame: async (roomCode: string): Promise<TProofRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const { roomSession } = await proofProcess.startGame(tx, { roomCode });
      return roomSession;
    });
  },
  getRoomSession: async (roomSessionId: number): Promise<TProofRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }

      return toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession);
    });
  },
  getRoomSessionByRoomId: async (
    roomId: number,
    processed?: boolean
  ): Promise<TProofRoomSession> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSessionByRoomId(
        tx,
        roomId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      return toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession);
    });
  },

  getRoleSetting: async (
    roomSessionId: number,
    memberId: number
  ): Promise<{ featureB: RoleFeatureB; skillDef: RoleSkillDef }> => {
    console.log("######roomSessionId##", roomSessionId);
    console.log("######memberId##", memberId);
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      const member = roomSession.room.members.find(
        (member) => member.id === memberId
      );
      if (!member) {
        throw new NotFoundError("Member not found");
      }
      const roleName = member.role
        ?.roleName as keyof typeof PROOF_ROLE_NAME_MAP;
      const setting = await proofRepository.getRoleSetting(tx, roomSessionId);
      if (setting) {
        const parsedSetting = JSON.parse(
          setting
        ) as ProofRoomSessionSettingJsonContents;
        return {
          featureB: parsedSetting.featureB[roleName],
          skillDef: parsedSetting.skillDef[roleName],
        };
      } else {
        throw new NotFoundError("Role setting not found");
      }
    });
  },
  initializeBomb: async (
    roomSessionId: number,
    proofCodes: string[],
    memberId: number,
    io: Server
  ) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      const member = await _getSessionRoomMember(tx, roomSessionId, memberId);

      if (proofCodes.length !== 3) {
        throw new BadRequestError("Proof codes must be 3");
      }

      if (new Set(proofCodes).size !== proofCodes.length) {
        throw new BadRequestError("Proof codes must be unique");
      }

      // 手札に爆弾を１枚作成
      let bombHintProof: TProof | null = null;
      let bombProof: TProof | null = null;
      const shuffledProofCodes = myUtil.shuffleArray(proofCodes);
      for (const proofCode of shuffledProofCodes) {
        const proof = await _getProofByRoomSessionIdAndCode(
          tx,
          roomSessionId,
          proofCode
        );
        if (proof.title === PROOF_BOMB_RESERVED_WORD) {
          bombHintProof = proof;
        } else {
          bombProof = proof;
        }
      }
      if (bombHintProof && bombProof) {
        await proofRepository.updateProofStatus(tx, bombProof.id, {
          bomFlg: true,
        });
        // 爆弾のヒントを作成
        await proofRepository.updateProofStatus(tx, bombHintProof.id, {
          title: "PROOF_BOMB_RESERVED_WORD",
          description: `${bombProof.code}は爆弾です`,
        });
      }
      await proofSpecialMoveExecutor.executeInitialize(
        member.role?.roleName as keyof typeof PROOF_ROLE_NAME_MAP,
        tx,
        member,
        roomSession,
        proofCodes
      );

      await proofRepository.updateRoomMemberStatus(
        tx,
        roomSession.room.id,
        member.userId,
        PROOF_MEMBER_STATUS.APPLY_CARD
      );
      noticeAllUserInfo(io, roomSession);
    });
  },

  turnIntoBomb: async (
    roomSessionId: number,
    memberId: number,
    proofCodes: string[]
  ): Promise<string[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const member = await _getSessionRoomMember(tx, roomSessionId, memberId);
      if (!isBomber(member)) {
        // ボマーじゃない時
      }

      const bomHintProof = (
        await proofRepository.getProofsByRoomSessionId(tx, roomSessionId)
      ).find((proof) => proof.title === PROOF_BOMB_RESERVED_WORD);

      for (const code of proofCodes) {
        const proof = await _getProofByRoomSessionIdAndCode(
          tx,
          roomSessionId,
          code
        );
        await proofRepository.updateProofStatus(tx, proof.id, { bomFlg: true });
      }
      // 爆弾のヒントには足跡を残す
      if (
        bomHintProof &&
        bomHintProof.status !== PROOF_STATUS.REVEALED_TO_ALL
      ) {
        await proofRepository.updateProofStatus(tx, bomHintProof.id, {
          title: PROOF_BOMB_RESERVED_WORD,
          description: `${proofCodes.join(",")}は爆弾になりました`,
          status: PROOF_STATUS.NORMAL,
        });
      }

      return proofCodes;
    });
  },
  getProofList: async (
    roomSessionId: number,
    memberId?: number
  ): Promise<TProof[]> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const proofs = await proofRepository.getProofsByRoomSessionId(
        tx,
        roomSessionId
      );
      const isAvaliableProof = (proof: TProof) => {
        if (memberId) {
          return (
            proof.status === PROOF_STATUS.REVEALED_TO_ALL ||
            (proof.status === PROOF_STATUS.REVEALED_TO_ONE &&
              proof.revealedBy.includes(memberId))
          );
        } else {
          return proof.status === PROOF_STATUS.REVEALED_TO_ALL;
        }
      };
      const mask = (proof: TProof) => {
        return {
          ...proof,
          ...{
            title: "???", // TODO ??? は固定値に
            description: "???",
            status: "???",
          },
        };
      };
      return proofs.map(toTProofFromProofList).map((proof) => {
        if (!isAvaliableProof(proof)) {
          return mask(proof);
        } else {
          return proof;
        }
      });
    });
  },

  getProofStatus: async (
    roomSessionId: number,
    code: string
  ): Promise<TProof | null> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const proof = await proofRepository.getProofByRoomSessionIdAndCode(
        tx,
        roomSessionId,
        code
      );
      if (proof) {
        return toTProofFromProofList(proof);
      } else {
        return null;
      }
    });
  },
  judgeAlreadyRevealed: async (
    roomSessionId: number,
    turn: number,
    memberId: number
  ): Promise<boolean> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      return await _judgeAlreadyRevealed(tx, roomSessionId, turn, memberId);
    });
  },
  revealProof: async (
    roomSessionId: number,
    code: string,
    revealedBy: number,
    isEntire: boolean,
    io: Server
  ): Promise<TRevealedResult> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      const isAlreadyRevealed = await _judgeAlreadyRevealed(
        tx,
        roomSessionId,
        roomSession.turn,
        revealedBy
      );
      if (isAlreadyRevealed) {
        throw new BadRequestError("Already revealed");
      }
      const revealedResult = await proofProcess.revealProofProcess(tx, io, {
        roomSessionId,
        code,
        revealedBy,
        isEntire,
      });
      return revealedResult;
    });
  },
  startTurn: async (roomSessionId: number): Promise<number> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      if (
        roomSession.status !== PROOF_ROOM_SESSION_STATUS.GAME_STARTED &&
        roomSession.status !== PROOF_ROOM_SESSION_STATUS.TURN_ENDED
      ) {
        throw new BadRequestError(
          "Room session is not in game started or turn ended"
        );
      }
      const nextTurn = roomSession.turn + 1;
      await proofRepository.updateRoomSession(tx, roomSessionId, {
        turn: nextTurn,
        status: PROOF_ROOM_SESSION_STATUS.ORDER_WAITING,
      });
      return nextTurn;
    });
  },
  startOrder: async (roomSessionId: number, io: Server): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      if (roomSession.status !== PROOF_ROOM_SESSION_STATUS.ORDER_WAITING) {
        console.log("startOrder", roomSession.status);
        throw new BadRequestError("Room session is not in order waiting");
      }
      const roomMembers = roomSession.room.members;
      const focusOnMember = roomMembers.find(
        (member) => member.id === roomSession.focusOn
      );
      if (!focusOnMember) {
        throw new NotFoundError("Focus on member not found");
      }
      console.log(
        "startOrder",
        focusOnMember.user?.displayName,
        focusOnMember.id
      );
      // await proofRepository.updateRoomSession(tx, roomSessionId, {
      //   status: PROOF_ROOM_SESSION_STATUS.ORDER_WAITING,
      // });

      // スキルの使用状況を初期段階に戻す
      for (const member of roomMembers) {
        await proofRepository.updateRoomMemberInfoDuringTurn(
          tx,
          roomSession.room.id,
          member.userId,
          { isSkillUsed: false }
        );
      }

      roomMembers.forEach((member) => {
        activateUser(io, member.userId, member.id === focusOnMember.id);
      });
      noticeAllUserInfo(io, roomSession);
    });
  },
  endOrder: async (
    roomSessionId: number,
    io: Server
  ): Promise<{ turnFinished: boolean; currentTurn: number }> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      if (roomSession.status !== PROOF_ROOM_SESSION_STATUS.ORDER_WAITING) {
        console.log("end", roomSession.status);
        throw new BadRequestError("Room session is not in order waiting");
      }
      const roomMembers = roomSession.room.members;
      const focusOnMember = roomMembers.find(
        (member) => member.id === roomSession.focusOn
      );
      if (!focusOnMember) {
        throw new NotFoundError("Focus on member not found");
      }
      let nextFocusOnMember = roomMembers.find(
        (member) => member.sort === focusOnMember.sort + 1
      );
      let finishFlg = false;
      if (!nextFocusOnMember) {
        // 次のメンバーがいない場合はturnを終了する
        console.log("endOrder", "end");
        finishFlg = true;
        nextFocusOnMember = roomMembers.sort((a, b) => a.sort - b.sort)[0];
      }
      // orderの終わり
      await proofRepository.updateRoomSession(tx, roomSessionId, {
        focusOn: nextFocusOnMember.id,
        status: finishFlg
          ? PROOF_ROOM_SESSION_STATUS.TURN_ENDED
          : PROOF_ROOM_SESSION_STATUS.ORDER_WAITING,
      });

      roomMembers.forEach((member) => {
        activateUser(io, member.userId, false);
      });
      noticeAllUserInfo(io, roomSession);

      return {
        turnFinished: finishFlg,
        currentTurn: roomSession.turn,
      };
    });
  },

  useSkill: async (
    roomSessionId: number,
    memberId: number,
    io: Server,
    params: unknown
  ): Promise<UseSkillResult> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      const member = await _getSessionRoomMember(tx, roomSessionId, memberId);
      const roleName = member.role
        ?.roleName as keyof typeof PROOF_ROLE_NAME_MAP;
      const result = await proofSpecialMoveExecutor.executeUseSkill(
        roleName,
        tx,
        member,
        roomSession,
        io,
        params
      );
      return result;
    });
  },
  addOrRemovePenalty: async (
    roomSessionId: number,
    memberId: number,
    penalty: string,
    isAdd: boolean
  ): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      const member = await _getSessionRoomMember(tx, roomSessionId, memberId);

      if (isAdd) {
        if (
          !(Object.values(PROOF_PENALTY_MAP) as readonly string[]).includes(
            penalty
          )
        ) {
          throw new BadRequestError("Invalid penalty");
        }
        // TODO 既存のペナルティとの関係
        await proofRepository.updateRoomMemberInfoDuringTurn(
          tx,
          roomSession.room.id,
          member.userId,
          { penalty: [...(member.penalty ?? []), penalty] }
        );
      } else {
        await proofRepository.updateRoomMemberInfoDuringTurn(
          tx,
          roomSession.room.id,
          member.userId,
          { penalty: member.penalty?.filter((p) => p !== penalty) }
        );
      }
    });
  },

  // 告発
  requestReport: async (
    roomSessionId: number,
    memberId: number,
    targetMemberId: number,
    proofCoodes: string[],
    io: Server
  ): Promise<RequestReportResult> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await _getSessionRoom(tx, roomSessionId);
      const member = await _getSessionRoomMember(tx, roomSessionId, memberId);
      const targetMember = await _getSessionRoomMember(
        tx,
        roomSessionId,
        targetMemberId
      );
      return await proofProcess.report(tx, io, {
        roomSession: roomSession,
        member: member,
        targetMember: targetMember,
        proofCodes: proofCoodes,
      });
    });
  },

  _forceFocus: async (
    roomSessionId: number,
    io: Server,
    memberId: number,
    isFocus: boolean
  ): Promise<void> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      console.log("memberId", memberId);
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      const member = roomSession.room.members.find(
        (member) => member.id === memberId
      );
      if (!member) {
        throw new NotFoundError("Member not found");
      }
      await proofRepository.updateRoomSession(tx, roomSessionId, {
        focusOn: isFocus ? member.id : 0,
      });
      const updatedRoomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (updatedRoomSession) {
        activateUser(io, member.userId, isFocus);
        noticeAllUserInfo(
          io,
          toTProofRoomSessionFromProofRoomSessionWithMembers(updatedRoomSession)
        );
      }
    });
  },
};
function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}

async function _judgeAlreadyRevealed(
  tx: Prisma.TransactionClient,
  roomSessionId: number,
  turn: number,
  memberId: number
): Promise<boolean> {
  const proofs = await proofRepository.getProofsByRoomSessionIdAndTurn(
    tx,
    roomSessionId,
    turn
  );
  return proofs
    .map(toTProofFromProofList)
    .some((proof) => proof.revealedBy.includes(memberId));
}
async function _getSessionRoom(
  tx: Prisma.TransactionClient,
  roomSessionId: number
): Promise<TProofRoomSession> {
  const roomSession = await proofRepository.getRoomSession(tx, roomSessionId);
  if (!roomSession) {
    throw new NotFoundError("Room session not found");
  }
  return toTProofRoomSessionFromProofRoomSessionWithMembers(roomSession);
}

async function _getSessionRoomMember(
  tx: Prisma.TransactionClient,
  roomSessionId: number,
  memberId: number
): Promise<TProofRoomMember> {
  const roomSession = await proofRepository.getRoomSession(tx, roomSessionId);
  if (!roomSession) {
    throw new NotFoundError("Room session not found");
  }
  const member = roomSession.room.members.find(
    (member) => member.id === memberId
  );
  if (!member) {
    throw new NotFoundError("Member not found");
  }
  return toTProofRoomMemberFromProofRoomMemberWithUsers(member);
}

async function _getProofByRoomSessionIdAndCode(
  tx: Prisma.TransactionClient,
  roomSessionId: number,
  proofCode: string
): Promise<TProof> {
  const proof = await proofRepository.getProofByRoomSessionIdAndCode(
    tx,
    roomSessionId,
    proofCode
  );
  if (!proof) {
    throw new NotFoundError(`Proof ${proofCode} not found`);
  }
  return toTProofFromProofList(proof);
}
