import RoleIF from "../roleIF";
import { TRoomMember, TRoomSession } from "../../domain/types";

import { ROLE_GROUP_MAP } from "../../domain/common";
import logger from "../../util/logger";
import { lineUtil } from "../../util/lineUtil";

class Emperor implements RoleIF {
  executeSpecialMove(): void {
    console.log("Emperor executeTurn");
  }
  executeInitialize(me: TRoomMember, roomSession: TRoomSession): void {
    let kingdomMemberString = "";

    roomSession.room.members
      .filter((member) => member.role?.group === ROLE_GROUP_MAP.KINGDOM)
      .forEach((member) => {
        kingdomMemberString += `${member.user?.displayName} : ${member.role?.roleName} \n`;
      });

    console.log("Emperor executeInitialize");
    logger.info(`Emperor executeInitialize: ${kingdomMemberString}`);
    if (me.user?.userId) {
      lineUtil.sendSimpleTextMessage(me.user?.userId, kingdomMemberString);
    }
  }
}

export default Emperor;
