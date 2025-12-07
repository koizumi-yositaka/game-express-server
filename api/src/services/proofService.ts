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
} from "../domain/proof/typeParse";
import {
  TProof,
  TProofRoom,
  TProofRoomSession,
  TRevealedResult,
  REVEALED_RESULT_CODE,
} from "../domain/proof/types";
import { lineUtil } from "../util/lineUtil";
import { userRepository } from "../repos/userRepository";
import { GAME_STATUS } from "../domain/common";
import { proofProcess } from "../process/proof/proofProcess";
import {
  PROOF_BOMB_RESERVED_WORD,
  PROOF_RANK,
  PROOF_STATUS,
  PROOF_MEMBER_STATUS,
  PROOF_ROLE_NAME_MAP,
} from "../domain/proof/proofCommon";
import { myUtil } from "../util/myUtil";
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
          await lineUtil.sendSimpleTextMessage(
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
      if (room.status !== GAME_STATUS.NOT_STARTED) {
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
  getRoomSession: async (
    roomSessionId: number,
    processed?: boolean
  ): Promise<TProofRoomSession> => {
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
  revealProof: async (
    roomSessionId: number,
    code: string,
    revealedBy: number,
    isEntire: boolean
  ): Promise<TRevealedResult> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const revealedResult = await proofProcess.revealProofProcess(tx, {
        roomSessionId,
        code,
        revealedBy,
        isEntire,
      });
      return revealedResult;
    });
  },
  createBomb: async (
    roomSessionId: number,
    proofCodes: string[],
    memberId: number
  ) => {
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
      await proofRepository.updateRoomMemberStatus(
        tx,
        roomSession.room.id,
        member.userId,
        PROOF_MEMBER_STATUS.APPLY_CARD
      );

      if (
        member.role.roleName !== PROOF_ROLE_NAME_MAP.BOMBER ||
        member.status === PROOF_MEMBER_STATUS.APPLY_CARD
      ) {
        return;
      }
      const proofRankAList = (
        await proofRepository.getProofsByRoomSessionId(tx, roomSessionId)
      ).filter(
        (proof) =>
          proof.rank === PROOF_RANK.A && proof.status === PROOF_STATUS.NORMAL
      );

      const randomIndex = myUtil.getRandomInt(0, proofCodes.length - 1);
      const randomProofCode = proofCodes[randomIndex];

      for (const proofCode of proofCodes) {
        const proof = await proofRepository.getProofByRoomSessionIdAndCode(
          tx,
          roomSessionId,
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
        await proofRepository.updateProofStatus(tx, proof.id, {
          status: PROOF_STATUS.BOMBED,
        });
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
    });
  },
};
function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}
