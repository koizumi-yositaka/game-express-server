export type TRoom = {
  id?: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: Date;
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

export type TRoomAndMembers = {
  room: TRoom;
  members: TRoomMember[];
};

export type TRole = {
  roleId: number;
  roleName: string;
  priority: number;
  description: string;
  imageUrl: string;
};
