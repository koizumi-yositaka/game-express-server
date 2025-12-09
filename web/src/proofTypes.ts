import {
  PROOF_MEMBER_STATUS,
  REVEALED_RESULT_CODE,
} from "@/common/proofCommon";

// roomのセッション情報
export type DTOProofRoomSession = {
  id: number;
  setting: ProofRoomSessionSettingJsonContents;
  focusOn: number;
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

export type ProofRoomSessionSettingJsonContents = {
  aCount: number;
  aDummyCount: number;
  bCount: number;
  bDummyCount: number;
  cCount: number;
  cDummyCount: number;
  featureB: Record<keyof typeof PROOF_ROLE_NAME_MAP, RoleFeatureB>;
};

export const PROOF_ROLE_NAME_MAP = Object.freeze({
  DETECTIVE: "DETECTIVE",
  BOMBER: "BOMBER",
  BOMB_SQUAD: "BOMB_SQUAD",
  LIER: "LIER",
  INFORMER: "INFORMER",
  MAGICIAN: "MAGICIAN",
});
export type RoleFeatureB = {
  borned: string;
  favariteFood: string;
  birthDay: string;
  yesterday: string;
};

export type DTOProofStatus = {
  isExists: boolean;
  ableToOpenToPublic: boolean;
  ableToOpenToPrivate: boolean;
};

export type RevealResult = {
  result: (typeof REVEALED_RESULT_CODE)[keyof typeof REVEALED_RESULT_CODE];
  message: string;
  proof?: DTOProof;
};

export type DecodedUserInfo = {
  roomSessionId: number;
  roomCode: string;
  displayName: string;
  userId: string;
  memberId: number;
  roleName: keyof typeof PROOF_ROLE_NAME_MAP;
  status: (typeof PROOF_MEMBER_STATUS)[keyof typeof PROOF_MEMBER_STATUS];
};
