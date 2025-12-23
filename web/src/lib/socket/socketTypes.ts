// shared/socketTypes.ts

import type { REVEALED_RESULT_CODE } from "@/common/proofCommon";
import type {
  DecodedUserInfo,
  DTOProof,
  DTOProofRoomSession,
} from "@/proofTypes";

// 例としてチャットメッセージ
export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: string; // ISO 文字列など
}

export type SessonRoomInfo = {
  sessionRoom: DTOProofRoomSession | null;
  error?: string;
};

export type RevealResult = {
  result: (typeof REVEALED_RESULT_CODE)[keyof typeof REVEALED_RESULT_CODE];
  message: string;
  proof?: DTOProof;
};

export type ExtendedUserInfo = DecodedUserInfo & {
  isFocusing: boolean;
};

// サーバ → クライアント
export interface ServerToClientEvents {
  "chat:message": (msg: ChatMessage) => void;
  "chat:init": (msgs: ChatMessage[]) => void;
  "auth:ok": (message: string) => void;
  "order:activate": (message: string) => void;
  "order:deactivate": (message: string) => void;
  "order:all": (sessionInfo: SessonRoomInfo) => void;
  "order:finished": () => void;
  "proof:init": (message: string) => void;
  "proof:revealResult": (result: RevealResult) => void;
}

// クライアント → サーバ
export interface ClientToServerEvents {
  "chat:send": (msg: Omit<ChatMessage, "id" | "createdAt">) => void;
  "auth:login": (userId: string, roomSessionId: string) => void;
  "order:all": (sessionRoomId: number) => void;
  "proof:init": (roomSessionId: number, memberId: number) => void;
}

// サーバ間で使うなら
export interface InterServerEvents {
  ping: () => void;
}

// 各ソケットに紐づけたい情報があれば
export interface SocketData {
  userId?: string;
}
