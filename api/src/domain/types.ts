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
  role: number;
  joinedAt: Date;
};
