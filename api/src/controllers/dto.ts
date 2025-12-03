import {
  RoomSessionSettingJsonContents,
  TCommandType,
  TDirection,
  TRole,
} from "../domain/types";

// roomのセッション情報
export type DTORoomSession = {
  id: number;
  posX: number;
  posY: number;
  direction: TDirection;
  setting: RoomSessionSettingJsonContents;
  turn: number;
  room: DTORoom;
  commands: DTOCommand[];
};

// roomの情報
export type DTORoom = {
  id: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: string;
  members: DTORoomMember[];
};

// roomに参加するmember
export type DTORoomMember = {
  id: number;
  status: number;
  joinedAt: string;
  user: DTOUser | null;
  role: TRole | null;
};

export type DTOUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt: string;
};

export type DTOUserStatus = {
  userId: string;
  invalidateFlg: boolean;
  isParticipating: boolean;
};

export type DTOCommand = {
  id: number;
  memberId: number;
  commandType: TCommandType;
  processed: boolean;
  arg: string;
};

export type DTOCommandHistory = {
  id: number;
  roomSessionId: number;
  memberId: number;
  commandId: number;
  turn: number;
  arg: string;
  command: DTOCommand;
};
// Lambda用

export type AddCommandResult = {
  roomSessionId: number;
  commandsCount: number;
  isValid: boolean;
};
