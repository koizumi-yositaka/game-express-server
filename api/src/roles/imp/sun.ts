import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { lineUtil } from "../../util/lineUtil";
import { Prisma } from "../../generated/prisma/client";
import logger from "../../util/logger";
class Sun implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Sun executeSpecialMove");
  }
  async executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> {
    const emperor = roomSession.room.members.find((member) => {
      if (member.role?.roleName === "EMPEROR") {
        return true;
      }
      return false;
    });
    logger.info(JSON.stringify(emperor, null, 2));
    if (emperor) {
      lineUtil.sendSimpleTextMessage(
        emperor.user?.userId ?? "",
        `EMPEROR IS ${emperor.user?.displayName}`
      );
    }
  }
}
export default Sun;
