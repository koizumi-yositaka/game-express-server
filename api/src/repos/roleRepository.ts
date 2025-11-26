import { prisma } from "../db/prisma";

export const roleRepository = {
  getRoles: async () => {
    return await prisma.mRole.findMany();
  },
};
