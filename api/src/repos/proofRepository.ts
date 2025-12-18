import { GAME_STATUS } from "../domain/common";
import {
  PROOF_ROOM_STATUS,
  PROOF_MEMBER_STATUS,
  PROOF_ROOM_SESSION_STATUS,
} from "../domain/proof/proofCommon";
import { ProofForm } from "../domain/proof/types";
import {
  PrismaClient,
  Prisma,
  ProofRoomMember,
  ProofRoom,
} from "../generated/prisma/client";
// members.user まで
export type ProofRoomWithUsers = Prisma.ProofRoomGetPayload<{
  include: {
    members: {
      include: { user: true; role: true };
    };
  };
}>;

export type ProofRoomWMemberWithUsers = Prisma.ProofRoomMemberGetPayload<{
  include: {
    user: true;
    role: true;
  };
}>;
// room.members.user, room.members.role まで含む
export type ProofRoomSessionWithMembers = Prisma.ProofRoomSessionGetPayload<{
  include: {
    room: {
      include: { members: { include: { user: true; role: true } } };
    };
  };
}>;

export type ProofListPure = Prisma.ProofListGetPayload<{}>;
type TxClient = PrismaClient | Prisma.TransactionClient;

export const proofRepository = {
  getRoles: async (tx: TxClient) => {
    return await tx.mProofRole.findMany();
  },
  /**###################### ROOM ######################**/
  createRoom: async (tx: TxClient, roomCode: string) => {
    return await tx.proofRoom.create({
      data: {
        roomCode: roomCode,
        status: PROOF_ROOM_STATUS.NOT_STARTED,
        openFlg: true,
      },
    });
  },
  getRooms: async (
    tx: TxClient,
    searchParams: { roomCode?: string }
  ): Promise<ProofRoomWithUsers[]> => {
    const rooms = await tx.proofRoom.findMany({
      where: {
        openFlg: true,
        ...(searchParams.roomCode && { roomCode: searchParams.roomCode }),
      },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return rooms;
  },
  getRoomByRoomCode: async (
    tx: TxClient,
    roomCode: string
  ): Promise<ProofRoomWithUsers | null> => {
    const room = await tx.proofRoom.findUnique({
      where: { roomCode: roomCode },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return room;
  },
  getRoomById: async (
    tx: TxClient,
    roomId: number
  ): Promise<ProofRoomWithUsers | null> => {
    const room = await tx.proofRoom.findUnique({
      where: { id: roomId },
      include: {
        members: { include: { user: true, role: true } },
      },
    });
    return room;
  },
  joinRoom: async (
    tx: TxClient,
    roomId: number,
    userId: string
  ): Promise<ProofRoomMember | null> => {
    return await tx.proofRoomMember.create({
      data: {
        roomId: roomId,
        userId: userId,
        status: PROOF_MEMBER_STATUS.ENTERED,
      },
    });
  },

  /**###################### ROOMMEMBER ######################**/
  isUserInOpenRoom: async (tx: TxClient, userId: string): Promise<boolean> => {
    const count = await tx.proofRoomMember.count({
      where: {
        userId: userId,
        room: {
          openFlg: true,
        },
      },
    });
    return count > 0;
  },
  updateRoomMemberRole: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    roleId: number
  ) => {
    return await tx.proofRoomMember.update({
      where: {
        roomId_userId: { roomId: roomId, userId: userId },
      },
      data: { roleId: roleId, status: PROOF_MEMBER_STATUS.ASSIGNED },
      include: {
        role: true,
      },
    });
  },
  updateRoomMemberStatus: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    status: number
  ) => {
    return await tx.proofRoomMember.update({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      data: { status: status },
    });
  },
  updateRoomMemberInfoDuringTurn: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    updateVal: {
      skillUsedTime?: number;
      penalty?: string[];
      isSkillUsed?: boolean;
    }
  ) => {
    const updateData = {
      ...(updateVal.skillUsedTime !== undefined && {
        skillUsedTime: updateVal.skillUsedTime,
      }),
      ...(updateVal.penalty !== undefined && {
        penalty: updateVal.penalty?.join(",") ?? "",
      }),
      ...(updateVal.isSkillUsed !== undefined && {
        isSkillUsed: updateVal.isSkillUsed,
      }),
    };
    return await tx.proofRoomMember.update({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      data: updateData,
    });
  },
  updateRoomMemberSort: async (
    tx: TxClient,
    roomId: number,
    userId: string,
    sort: number
  ) => {
    return await tx.proofRoomMember.update({
      where: { roomId_userId: { roomId: roomId, userId: userId } },
      data: { sort: sort },
    });
  },
  // 以下get
  // これは役割が振られる前にしか使わないので、roleは含めない
  getRoomMembers: async (tx: TxClient, roomId: number) => {
    return await tx.proofRoomMember.findMany({
      where: { roomId: roomId },
      include: {
        room: true,
      },
    });
  },
  getRoomMemberByRoomCodeAndUserId: async (
    tx: TxClient,
    roomCode: string,
    userId: string
  ): Promise<ProofRoomWMemberWithUsers | null> => {
    return await tx.proofRoomMember.findFirst({
      where: {
        room: {
          roomCode: roomCode,
        },
        user: {
          userId: userId,
        },
      },
      include: {
        user: true,
        role: true,
      },
    });
  },

  updateRoom: async (
    tx: TxClient,
    roomId: number,
    updateVal: { openFlg?: boolean; status?: number }
  ): Promise<ProofRoom | null> => {
    console.log("updateRoom", "roomId", roomId, "updateVal", updateVal);
    const updateData = {
      ...(updateVal.openFlg !== undefined && { openFlg: updateVal.openFlg }),
      ...(updateVal.status !== undefined && { status: updateVal.status }),
    };
    const updatedRoom = await tx.proofRoom.update({
      where: { id: roomId },
      data: updateData,
    });
    return updatedRoom;
  },
  /**###################### ROOMSESSION ######################**/
  createRoomSession: async (
    tx: TxClient,
    roomId: number,
    setting: string,
    focusOn: number
  ) => {
    return await tx.proofRoomSession.create({
      data: {
        roomId: roomId,
        setting: setting,
        focusOn: focusOn,
        status: PROOF_ROOM_SESSION_STATUS.GAME_STARTED,
      },
    });
  },

  updateRoomSession: async (
    tx: TxClient,
    roomSessionId: number,
    updateVal: {
      turn?: number;
      focusOn?: number;
      status?: number;
    }
  ) => {
    return await tx.proofRoomSession.update({
      where: { id: roomSessionId },
      data: updateVal,
    });
  },
  getRoomSession: async (
    tx: TxClient,
    roomSessionId: number
  ): Promise<ProofRoomSessionWithMembers | null> => {
    const roomSession = await tx.proofRoomSession.findUnique({
      where: { id: roomSessionId },
      select: {
        id: true,
        turn: true,
        status: true,
        focusOn: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: {
          include: {
            members: { include: { user: true, role: true } },
          },
        },
      },
    });
    return roomSession
      ? {
          ...roomSession,
          setting: "",
        }
      : null;
  },
  getRoomSessionByRoomId: async (
    tx: TxClient,
    roomId: number
  ): Promise<ProofRoomSessionWithMembers | null> => {
    const roomSession = await tx.proofRoomSession.findFirst({
      where: { roomId: roomId },
      select: {
        id: true,
        turn: true,
        status: true,
        focusOn: true,
        roomId: true,
        createdAt: true,
        updatedAt: true,
        room: { include: { members: { include: { user: true, role: true } } } },
      },
    });
    return roomSession
      ? {
          ...roomSession,
          setting: "",
        }
      : null;
  },
  getRoleSetting: async (
    tx: TxClient,
    roomSessionId: number
  ): Promise<string | null> => {
    const roomSession = await tx.proofRoomSession.findUnique({
      where: { id: roomSessionId },
      select: {
        setting: true,
      },
    });
    return roomSession ? roomSession.setting : null;
  },
  createProofs: async (
    tx: TxClient,
    roomSessionId: number,
    proofs: ProofForm[]
  ) => {
    return await tx.proofList.createMany({
      data: proofs.map((proof) => ({
        roomSessionId: roomSessionId,
        code: proof.code,
        rank: proof.rank,
        status: proof.status,
        title: proof.title,
        description: proof.description,
      })),
    });
  },
  getProofsByRoomSessionId: async (tx: TxClient, roomSessionId: number) => {
    return await tx.proofList.findMany({
      where: { roomSessionId: roomSessionId },
    });
  },
  getProofsByRoomSessionIdAndTurn: async (
    tx: TxClient,
    roomSessionId: number,
    turn: number
  ) => {
    return await tx.proofList.findMany({
      where: {
        roomSessionId: roomSessionId,
        revealedTurn: turn,
      },
    });
  },
  getProofByRoomSessionIdAndCode: async (
    tx: TxClient,
    roomSessionId: number,
    code: string
  ): Promise<ProofListPure | null> => {
    return await tx.proofList.findFirst({
      where: { roomSessionId: roomSessionId, code: code },
    });
  },
  // updateProofStatusAndRevealedBy: async (
  //   tx: TxClient,
  //   roomSessionId: number,
  //   code: string,
  //   status: string,
  //   revealedBy: number
  // ) => {
  //   return await tx.proofList.update({
  //     where: { roomSessionId: roomSessionId, code: code },
  //     data: { status: status, revealedBy: revealedBy },
  //   });
  // },
  updateProofStatus: async (
    tx: TxClient,
    proofId: number,
    updateVal: {
      status?: string;
      revealedBy?: string;
      title?: string;
      description?: string;
      revealedTurn?: number;
      bomFlg?: boolean;
      refer?: string;
    }
  ) => {
    const updateData = {
      ...(updateVal.status !== undefined && { status: updateVal.status }),
      ...(updateVal.revealedBy !== undefined && {
        revealedBy: updateVal.revealedBy,
      }),
      ...(updateVal.title !== undefined && { title: updateVal.title }),
      ...(updateVal.description !== undefined && {
        description: updateVal.description,
      }),
      ...(updateVal.revealedTurn !== undefined && {
        revealedTurn: updateVal.revealedTurn,
      }),
      ...(updateVal.bomFlg !== undefined && { bomFlg: updateVal.bomFlg }),
      ...(updateVal.refer !== undefined && { references: updateVal.refer }),
    };
    return await tx.proofList.update({
      where: { id: proofId },
      data: updateData,
    });
  },
  deleteProofByRoomSessionId: async (tx: TxClient, roomSessionId: number) => {
    console.log("deleteProofByRoomSessionId", roomSessionId);
    return await tx.proofList.deleteMany();
  },
};
