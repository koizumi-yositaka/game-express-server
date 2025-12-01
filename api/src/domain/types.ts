import z from "zod";
export type TRoom = {
  id: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: Date;
  members: TRoomMember[];
};

export type TUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt?: Date;
};

export type TRoomMember = {
  id: number;
  roomId: number;
  userId: string;
  roleId: number;
  joinedAt: Date;
  user?: TUser;
  role?: TRole;
};

export type TRoomSession = {
  id: number;
  roomId: number;
  posX: number;
  posY: number;
  turn: number;
  direction: TDirection;
  status: number;
  setting: string;
  room: TRoom;
  commands: TCommand[];
};

export type TCommand = {
  id?: number;
  roomSessionId: number;
  memberId: number;
  commandType: TCommandType;
  processed: boolean;
};

export type TRole = {
  roleId: number;
  roleName: string;
  priority: number;
  description: string;
  imageUrl: string;
  notionUrl: string;
};
export type RoomSessionSettingJsonContents = {
  size: number;
  initialCell: [number, number];
  initialDirection: TDirection;
  specialCells: [number, number][];
  goalCell: [number, number];
};

export const CommandTypeSchema = z.enum(["FORWARD", "TURN_RIGHT"]);
export type TCommandType = z.infer<typeof CommandTypeSchema>;

export const DirectionSchema = z.enum(["N", "E", "S", "W"]);
export type TDirection = z.infer<typeof DirectionSchema>;
