import Emperor from "./imp/emperor";
import RoleIF from "./roleIF";

import { ROLE_NAME_MAP } from "../domain/common";
import Death from "./imp/death";
import { TCommand, TRoomMember, TRoomSession } from "../domain/types";
import Hierophant from "./imp/hierophant";
import { Prisma } from "../generated/prisma/client";
import Sun from "./imp/sun";
import Moon from "./imp/moon";
import Fool from "./imp/fool";
import Tower from "./imp/tower";

export const roleSpecialMoveExecutor = {
  executeSpecialMove: async (
    className: keyof typeof ROLE_NAME_MAP,
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> => {
    const classInstance = new classNameMap[className]();
    await classInstance.executeSpecialMove(tx, command, roomSession);
  },
  executeInitialize: async (
    className: keyof typeof ROLE_NAME_MAP,
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> => {
    const classInstance = new classNameMap[className]();
    await classInstance.executeInitialize(me, roomSession);
  },
};

const classNameMap: Record<keyof typeof ROLE_NAME_MAP, new () => RoleIF> = {
  EMPEROR: Emperor,
  DEATH: Death,
  HIEROPHANT: Hierophant,
  FOOL: Fool,
  THE_TOWER: Tower,
  SUN: Sun,
  MOON: Moon,
};
