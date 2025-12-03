// roomのセッション情報
export type DTORoomSession = {
  id: number;
  posX: number;
  posY: number;
  direction: TDirection;
  turn: number;
  setting: RoomSessionSettingJsonContents;
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
};

export type DTOCommandHistory = {
  id: number;
  roomSessionId: number;
  memberId: number;
  commandId: number;
  turn: number;
  command: DTOCommand;
};

export type RoomSessionSettingJsonContents = {
  size: number;
  initialCell: [number, number];
  initialDirection: TDirection;
  specialCells: [number, number][];
  goalCell: [number, number][];
};

// 以下上書き禁止
export type TRole = {
  roleId: number;
  roleName: string;
  priority: number;
  description: string;
  imageUrl: string;
};

export type TDirection = "N" | "E" | "S" | "W";

export type TCommandType =
  | "SPECIAL"
  | "SKIP"
  | "FORWARD"
  | "TURN_RIGHT"
  | "TURN_LEFT";

// UI側のType
export type TConfirmModal = {
  title: string;
  type: "confirm" | "info" | "error";
  isOpen: boolean;
  description: string;
  execLabel?: string;
  cancelLabel?: string;
  resolve: (result: boolean) => void;
  isOnlyYes?: boolean; // はいのみ、メッセージ表示にしようする
};
