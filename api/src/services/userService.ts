import { userRepository } from "../repos/userRepository";
import { TUser } from "../domain/types";
import { prisma } from "../db/prisma";
import { Prisma, User } from "../generated/prisma/client";
import { roomMemberRepository } from "../repos/roomMemberRepository";
import { NotFoundError } from "../error/AppError";
import { toTUser } from "../domain/typeParse";
export const userService = {
  getUsers: async () => {
    return await userRepository.getUsers();
  },
  getUser: async (userId: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await userRepository.getUser(tx, userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return toTUser(user);
    });
  },
  registerUser: async (userId: string, displayName: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
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
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const existingUser = await userRepository.getUser(tx, userId);
      if (!existingUser) {
        throw new NotFoundError("ユーザーが見つかりません");
      }
      if (existingUser.invalidateFlg) {
        console.log("ユーザーはすでに無効化されています");
        return toTUser(existingUser);
      }
      return toTUser(
        await userRepository.updateUser(tx, userId, { invalidateFlg: true })
      );
    });
  },
  getUserStatus: async (userId: string) => {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await userRepository.getUser(tx, userId);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      const isParticipating = await roomMemberRepository.isUserInOpenRoom(
        tx,
        userId
      );
      return {
        userId,
        invalidateFlg: user.invalidateFlg,
        isParticipating,
      };
    });
  },
};
