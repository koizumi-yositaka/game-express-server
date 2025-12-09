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
} from "../domain/proof/proofCommon";
import { myUtil } from "../util/myUtil";
import { proofSpecialMoveExecutor } from "../roles/proof/roleSpecialMoveExecutor";
import { roomSessionService } from "./roomSessionService";
import { Server } from "socket.io";
import { activateUser } from "../util/proofUtil";
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

  initializeBomb: async (
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
  startTurn: async (roomSessionId: number): Promise<number> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
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
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
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
        focusOnMember.user.displayName,
        focusOnMember.id
      );
      // await proofRepository.updateRoomSession(tx, roomSessionId, {
      //   status: PROOF_ROOM_SESSION_STATUS.ORDER_WAITING,
      // });
      roomMembers.forEach((member) => {
        console.log(
          "activateUser",
          member.userId,
          member.id === focusOnMember.id
        );
        activateUser(io, member.userId, member.id === focusOnMember.id);
      });
    });
  },
  endOrder: async (roomSessionId: number, io: Server): Promise<number> => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const roomSession = await proofRepository.getRoomSession(
        tx,
        roomSessionId
      );
      if (!roomSession) {
        throw new NotFoundError("Room session not found");
      }
      if (roomSession.status !== PROOF_ROOM_SESSION_STATUS.ORDER_WAITING) {
        console.log("end", roomSession.status);
        throw new BadRequestError("Room session is not in order waiting");
      }
      const roomMembers = roomSession.room.members;
      const focusOnMember = roomMembers.find(
        (member) => member.id === roomSession.focusOn
      );
      let nextFocusOnMember = roomMembers.find(
        (member) => member.id === roomSession.focusOn + 1
      );
      let finishFlg = false;
      if (!nextFocusOnMember) {
        // 次のメンバーがいない場合はturnを終了する
        console.log("endOrder", "end");
        finishFlg = true;
        nextFocusOnMember = roomMembers.sort((a, b) => a.sort - b.sort)[0];
      }
      await proofRepository.updateRoomSession(tx, roomSessionId, {
        focusOn: nextFocusOnMember.id,
        status: finishFlg
          ? PROOF_ROOM_SESSION_STATUS.TURN_ENDED
          : PROOF_ROOM_SESSION_STATUS.ORDER_WAITING,
      });

      roomMembers.forEach((member) => {
        activateUser(io, member.userId, false);
      });

      console.log("endOrder", nextFocusOnMember.user.displayName);

      return nextFocusOnMember.id;
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
      activateUser(io, member.userId, isFocus);
    });
  },
};
function generate4DigitCode(): string {
  const num = randomInt(0, 10000);
  return num.toString().padStart(4, "0");
}
