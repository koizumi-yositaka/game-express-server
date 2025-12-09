// shared/socketTypes.ts

import { DecodedUserInfo } from "../controllers/proof/dto";

// 例としてチャットメッセージ
export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: string; // ISO 文字列など
}

export interface SessonRoomInfo {
  sessionRoomId: number;
  roomCode: string;
  roomId: number;
}
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
  "proof:init": (mes: string) => void;
}

// クライアント → サーバ
export interface ClientToServerEvents {
  "chat:send": (msg: Omit<ChatMessage, "id" | "createdAt">) => void;
  "auth:login": (userId: string, roomSessionId: string) => void;
  "proof:init": (roomSessionId: number, memberId: number) => void;
}

// サーバ間で使うなら
export interface InterServerEvents {
  ping: () => void;
}

// 各ソケットに紐づけたい情報があれば
export interface SocketData {
  userId?: string;
  roomSessionId?: string;
}
