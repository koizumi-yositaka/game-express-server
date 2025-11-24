import { TUser } from "../domain/types";
import { PrismaClient, Prisma } from "../generated/prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export const userRepository = {
  getUsers: async () => {
    return { message: "users" };
  },
  getUser: async (tx: TxClient, userId: string) => {
    return await tx.user.findUnique({
      where: { userId: userId },
    });
  },
  registerUser: async (tx: TxClient, user: TUser) => {
    return await tx.user.create({
      data: {
        userId: user.userId,
        displayName: user.displayName,
        invalidateFlg: user.invalidateFlg,
      },
    });
  },
  updateUser: async (
    tx: TxClient,
    userId: string,
    updateVal: { invalidateFlg?: boolean; displayName?: string }
  ) => {
    const updateUserData = {
      ...(updateVal.invalidateFlg !== undefined && {
        invalidateFlg: updateVal.invalidateFlg,
      }),
      ...(updateVal.displayName !== undefined && {
        displayName: updateVal.displayName,
      }),
    };
    console.log("updateUserData", updateUserData);
    return await tx.user.update({
      where: { userId: userId },
      data: updateUserData,
    });
  },
};
