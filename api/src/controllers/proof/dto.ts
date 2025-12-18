import {
  PROOF_MEMBER_STATUS,
  PROOF_ROLE_NAME_MAP,
} from "../../domain/proof/proofCommon";
// roomのセッション情報
export type DTOProofRoomSession = {
  id: number;
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
  isSkillUsed: boolean;
  status: number;
  skillUsedTime: number;
  penalty: string[];
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
  refer: string;
  bomFlg: boolean;
  rank: string;
  status: string;
  title: string;
  description: string;
  revealedTurn: number;
  revealedBy: number[];
};

export type DTOProofStatus = {
  isExists: boolean;
  ableToOpenToPublic: boolean;
  ableToOpenToPrivate: boolean;
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

export type UseSkillResult = {
  isSuccess: boolean;
  result: string;
};

export type RequestReportResult = {
  isSuccess: boolean;
  message: string;
  ngList: { proofCode: string; message: string }[];
};
