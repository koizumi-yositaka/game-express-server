import { userRepository } from "../repos/userRepository";
import { TUser } from "../domain/types";
import { prisma } from "../db/prisma";
import { User } from "../generated/prisma/client";
export const userService = {
  getUsers: async () => {
    return await userRepository.getUsers();
  },
  getUser: async (userId: string) => {
    return await prisma.$transaction(async (tx) => {
      return toTUser(await userRepository.getUser(tx, userId));
    });
  },
  registerUser: async (userId: string, displayName: string) => {
    return await prisma.$transaction(async (tx) => {
      const existingUser = await userRepository.getUser(tx, userId);

      console.log("existingUser", existingUser);
      // ユーザーが存在し、無効化されている場合は有効化する
      if (existingUser) {
        if (existingUser.invalidateFlg) {
          return toTUser(
            await userRepository.updateUser(tx, userId, {
              invalidateFlg: false,
            })
          );
        } else {
          return toTUser(existingUser);
        }
      } else {
        return toTUser(
          await userRepository.registerUser(tx, {
            userId,
            displayName,
            invalidateFlg: false,
          })
        );
      }
    });
  },
  invalidateUser: async (userId: string) => {
    return await prisma.$transaction(async (tx) => {
      const existingUser = await userRepository.getUser(tx, userId);
      if (!existingUser) {
        throw new Error("User not found");
      }
      if (existingUser.invalidateFlg) {
        console.log("User is already invalidated");
        return toTUser(existingUser);
      }
      return toTUser(
        await userRepository.updateUser(tx, userId, { invalidateFlg: true })
      );
    });
  },
};

function toTUser(user: User | null): TUser | null {
  if (!user) return null;
  return {
    userId: user.userId,
    displayName: user.displayName,
    invalidateFlg: user.invalidateFlg,
    createdAt: user.createdAt,
  };
}
