import { ProofRoomSessionSettingJsonContents } from "../../domain/proof/types";
// roomのセッション情報
export type DTOProofRoomSession = {
  id: number;
  setting: ProofRoomSessionSettingJsonContents;
  turn: number;
  status: number;
  room: DTOProofRoom;
};

// roomの情報
export type DTOProofRoom = {
  id: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: string;
  members: DTOProofRoomMember[];
};

// roomに参加するmember
export type DTOProofRoomMember = {
  id: number;
  sort: number;
  status: number;
  joinedAt: string;
  user: DTOProofUser | null;
  role: DTOProofRole | null;
};

export type DTOProofUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt: string;
};

export type DTOProofRole = {
  roleId: number;
  roleName: string;
  priority: number;
  description: string;
  imageUrl: string;
  notionUrl: string;
  group: number;
};

export type DTOProofUserStatus = {
  userId: string;
  invalidateFlg: boolean;
  isParticipating: boolean;
};

export type DTOProof = {
  id: number;
  roomSessionId: number;
  code: string;
  rank: string;
  status: string;
  title: string;
  description: string;
  revealedBy: number[];
};
