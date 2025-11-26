type DTORoom = {
  id?: number;
  roomCode: string;
  status: number;
  openFlg: boolean;
  createdAt: Date;
};

type DTOTRoomMember = {
  id: number;
  roomId: number;
  userId: string;
  roleId: number;
  joinedAt: Date;
  user?: TUser;
};

export type TUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt?: Date;
};

type DTORoomMembers = {
  room: DTORoom;
  members: DTOTRoomMember[];
};
type DTOUserStatus = {
  userId: string;
  invalidateFlg: boolean;
  isParticipating: boolean;
};

export type { DTORoom, DTOTRoomMember, DTORoomMembers, DTOUserStatus };
