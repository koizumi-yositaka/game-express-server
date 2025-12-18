import { TProofRoomMember } from "../../domain/proof/types";
import { TProofRoomSession } from "../../domain/proof/types";
import { Prisma } from "../../generated/prisma/client";
import {
  PROOF_ROLE_NAME_MAP,
  PROOF_ROLE_SETTING,
} from "../../domain/proof/proofCommon";
import ProofIF from "./proofIF";
import Bomber from "./imp/bomber";
import BombSquad from "./imp/bombSquad";
import Strength from "./imp/strength";
import Switcher from "./imp/switcher";
import { Server } from "socket.io";
import { BadRequestError } from "../../error/AppError";
import { proofRepository } from "../../repos/proofRepository";
import { UseSkillResult } from "../../controllers/proof/dto";
import Five from "./imp/five";
import Six from "./imp/six";
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
    io: Server,
    params: unknown
  ): Promise<UseSkillResult> => {
    if (!me.role) {
      throw new BadRequestError("Member role not found");
    }
    const roleName = me.role.roleName as keyof typeof PROOF_ROLE_NAME_MAP;
    const setting = PROOF_ROLE_SETTING[roleName];
    if (!setting) {
      throw new BadRequestError("Role setting not found");
    }
    if (setting.skillLimit !== 0 && me.skillUsedTime >= setting.skillLimit) {
      throw new BadRequestError("Skill limit reached");
    }
    console.log("executeUseSkill", className);

    const classInstance = new classNameMap[className]();
    const result = await classInstance.executeUseSkill(
      tx,
      me,
      roomSession,
      io,
      params
    );
    if (result.isSuccess) {
      await proofRepository.updateRoomMemberInfoDuringTurn(
        tx,
        roomSession.room.id,
        me.userId,
        {
          skillUsedTime: me.skillUsedTime + 1,
          isSkillUsed: true,
        }
      );
    }
    return result;
  },
};

const classNameMap: Record<
  keyof typeof PROOF_ROLE_NAME_MAP,
  new () => ProofIF<unknown>
> = {
  BOMBER: Bomber,
  BOMB_SQUAD: BombSquad,
  STRENGTH: Strength,
  SWITCHER: Switcher,
  FIVE: Five,
  SIX: Six,
};
