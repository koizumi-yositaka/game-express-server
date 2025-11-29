import { PrismaClient, Prisma } from "../generated/prisma/client";

type TxClient = PrismaClient | Prisma.TransactionClient;

export const invalidateLineUserFormRepo = {
  invalidateLineUserForm: async (tx: TxClient, formId: string) => {
    return await tx.invalidatedLineUserForm.create({
      data: {
        formId: formId,
      },
    });
  },
  checkIsInvalidated: async (tx: TxClient, formId: string) => {
    return await tx.invalidatedLineUserForm.findUnique({
      where: { formId: formId },
    });
  },
};
