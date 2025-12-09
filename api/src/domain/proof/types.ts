import z from "zod";
import { PROOF_MEMBER_STATUS, PROOF_ROLE_NAME_MAP } from "./proofCommon";
export type TProofRoom = {
  id: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: Date;
  members: TProofRoomMember[];
};

export type TUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt?: Date;
};

export type TProofRoomMember = {
  id: number;
  roomId: number;
  userId: string;
  roleId: number;
  status: number;
  sort: number;
  joinedAt: Date;
  user?: TUser;
  role?: TProofRole;
};

export type TProofRoomSession = {
  id: number;
  roomId: number;
  turn: number;
  status: number;
  setting: string;
  focusOn: number;
  room: TProofRoom;
};

export type TProofRole = {
  roleId: number;
  roleName: string;
  priority: number;
  description: string;
  imageUrl: string;
  notionUrl: string;
  group: number;
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

export type ProofForm = {
  roomSessionId: number;
  rank: string;
  code: string;
  status: string;
  title: string;
  description: string;
};

export type TProof = {
  id: number;
  roomSessionId: number;
  code: string;
  rank: string;
  status: string;
  title: string;
  description: string;
  revealedBy: number[];
};

export type RoleFeatureB = {
  borned: string;
  favariteFood: string;
  birthDay: string;
  yesterday: string;
};

export const PROOF_ROLE_FEATURE_B_KEYS = Object.freeze({
  BORNED: "borned",
  FAVARITE_FOOD: "favariteFood",
  BIRTH_DAY: "birthDay",
  YESTERDAY: "yesterday",
});

export type RoleFeatureC = {};
// export const CommandTypeSchema = z.enum([
//   "SPECIAL",
//   "SKIP",
//   "FORWARD",
//   "TURN_RIGHT",
//   "TURN_LEFT",
// ]);
// export type TCommandType = z.infer<typeof CommandTypeSchema>;

// export const DirectionSchema = z.enum(["N", "E", "S", "W"]);
// export type TDirection = z.infer<typeof DirectionSchema>;

export type UserToken = {
  roomSessionId: number;
  memberId: number;
  roleId: number;
};

export const REVEALED_RESULT_CODE = Object.freeze({
  SUCCESS: "SUCCESS",
  DISARM_SUCCESS: "DISARM_SUCCESS",
  ALREADY_REVEALED: "ALREADY_REVEALED",
  BOMBED: "BOMBED",
  INVALID_CODE: "INVALID_CODE",
});
export type TRevealedResult = {
  result: (typeof REVEALED_RESULT_CODE)[keyof typeof REVEALED_RESULT_CODE];
  message: string;
  proof?: TProof;
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
