export type TRoom = {
  id?: number;
  roomCode: string;
  openFlg: boolean;
  createdAt: Date;
};

export type TUser = {
  userId: string;
  displayName: string;
  invalidateFlg: boolean;
  createdAt?: Date;
};
