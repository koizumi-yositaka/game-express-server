import { TProofRoomMember } from "../../domain/proof/types";
import { TProofRoomSession } from "../../domain/proof/types";
import { Prisma } from "../../generated/prisma/client";
import { PROOF_ROLE_NAME_MAP } from "../../domain/proof/proofCommon";
import ProofIF from "./proofIF";
import Detective from "./imp/detective";
import Bomber from "./imp/bomber";
import BombSquad from "./imp/bombSquad";
import Lier from "./imp/lier";
import Informer from "./imp/informer";
import Magician from "./imp/magician";
export const proofSpecialMoveExecutor = {
  executeInitialize: async (
    className: keyof typeof PROOF_ROLE_NAME_MAP,
    tx: Prisma.TransactionClient,
    me: TProofRoomMember,
    roomSession: TProofRoomSession,
    proofCodes: string[]
  ): Promise<void> => {
    const classInstance = new classNameMap[className]();
    await classInstance.executeInitialize(tx, me, roomSession, proofCodes);
  },
};

const classNameMap: Record<
  keyof typeof PROOF_ROLE_NAME_MAP,
  new () => ProofIF
> = {
  DETECTIVE: Detective,
  BOMBER: Bomber,
  BOMB_SQUAD: BombSquad,
  LIER: Lier,
  INFORMER: Informer,
  MAGICIAN: Magician,
};
