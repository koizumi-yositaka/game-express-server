import { PrismaClient, Prisma } from "../generated/prisma/client";
import { TCommandType } from "../domain/types";

type TxClient = PrismaClient | Prisma.TransactionClient;

export type CommandHistoryWithCommandAndMember =
  Prisma.CommandHistoryGetPayload<{
    include: {
      command: true;
    };
  }>;

export const commandRepository = {
  createCommand: async (
    tx: TxClient,
    roomSessionId: number,
    memberId: number,
    commandType: TCommandType,
    arg: string
  ) => {
    return await tx.command.create({
      data: {
        roomSessionId: roomSessionId,
        memberId: memberId,
        commandType: commandType,
        arg: arg,
      },
    });
  },

  updateCommand: async (
    tx: TxClient,
    commandId: number,
    processed: boolean
  ) => {
    return await tx.command.update({
      where: { id: commandId },
      data: { processed: processed },
    });
  },

  createCommandHistory: async (
    tx: TxClient,
    roomSessionId: number,
    memberId: number,
    commandId: number,
    turn: number,
    arg: string
  ) => {
    return await tx.commandHistory.create({
      data: {
        roomSessionId: roomSessionId,
        memberId: memberId,
        commandId: commandId,
        turn: turn,
        arg: arg,
      },
    });
  },
  getCommandHistory: async (
    tx: TxClient,
    roomSessionId: number,
    turn?: number
  ): Promise<CommandHistoryWithCommandAndMember[]> => {
    const condition = { roomSessionId: roomSessionId };

    return await tx.commandHistory.findMany({
      where: {
        ...condition,
        ...(turn ? { turn: turn } : {}),
      },
      include: {
        command: true,
      },
    });
  },
};
