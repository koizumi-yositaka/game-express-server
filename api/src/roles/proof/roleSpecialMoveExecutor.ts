import { TProofRoomMember } from "../../domain/proof/types";
import { TProofRoomSession } from "../../domain/proof/types";
import { Prisma } from "../../generated/prisma/client";
import { PROOF_ROLE_NAME_MAP } from "../../domain/proof/proofCommon";
import ProofIF from "./proofIF";
import Bomber from "./imp/bomber";
import BombSquad from "./imp/bombSquad";
import Strength from "./imp/strength";
import { Server } from "socket.io";
export const proofSpecialMoveExecutor = {
  executeInitialize: async (
    className: keyof typeof PROOF_ROLE_NAME_MAP,
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> => {
    console.log("executeInitialize", className, proofCodes);
    const classInstance = new classNameMap[className]();
    await classInstance.executeInitialize(tx, me, roomSession, proofCodes);
  },
  executeUseSkill: async (
    className: keyof typeof PROOF_ROLE_NAME_MAP,
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    io: Server
  ): Promise<void> => {
    console.log("executeUseSkill", className);
    const classInstance = new classNameMap[className]();
    await classInstance.executeUseSkill(tx, me, roomSession, io);
  },
};

const classNameMap: Record<
  keyof typeof PROOF_ROLE_NAME_MAP,
  new () => ProofIF
> = {
  BOMBER: Bomber,
  BOMB_SQUAD: BombSquad,
  STRENGTH: Strength,
};
