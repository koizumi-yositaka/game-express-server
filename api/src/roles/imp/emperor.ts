import RoleIF from "../roleIF";
import { TRoomSession } from "../../domain/types";
import { ROLE_GROUP_MAP } from "../../domain/common";
import logger from "../../util/logger";

class Emperor implements RoleIF {
  executeSpecialMove(): void {
    console.log("Emperor executeTurn");
  }
  executeInitialize(roomSession: TRoomSession): void {
    let kingdomMemberString = "";
    roomSession.room.members
      .filter((member) => member.role?.group === ROLE_GROUP_MAP.KINGDOM)
      .forEach((member) => {
        kingdomMemberString += `${member.user?.displayName} : ${member.role?.roleName} \n`;
      });

    console.log("Emperor executeInitialize");
    logger.info(`Emperor executeInitialize: ${kingdomMemberString}`);
  }
}

export default Emperor;
