// shared/socketTypes.ts

import type { DecodedUserInfo } from "@/proofTypes";

// 例としてチャットメッセージ
export interface ChatMessage {
  id: string;
  user: string;
  text: string;
  createdAt: string; // ISO 文字列など
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
  "proof:init": (message: string) => void;
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
}
