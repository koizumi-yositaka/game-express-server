import Emperor from "./imp/emperor";
import RoleIF from "./roleIF";

import { ROLE_NAME_MAP } from "../domain/common";
import Death from "./imp/death";
import { TRoomSession } from "../domain/types";

export const roleSpecialMoveExecutor = {
  executeSpecialMove: (className: keyof typeof ROLE_NAME_MAP): void => {
    const classInstance = new classNameMap[className]();
    classInstance.executeSpecialMove();
  },
  executeInitialize: (
    className: keyof typeof ROLE_NAME_MAP,
    roomSession: TRoomSession
  ): void => {
    const classInstance = new classNameMap[className]();
    classInstance.executeInitialize(roomSession);
  },
};

const classNameMap: Record<keyof typeof ROLE_NAME_MAP, new () => RoleIF> = {
  EMPEROR: Emperor,
  DEATH: Death,
  HIEROPHANT: Death,
  FOOL: Death,
  HIGH_PRIESTESS: Death,
  HERMIT: Death,
  THE_TOWER: Death,
};
