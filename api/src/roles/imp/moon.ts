import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { Prisma } from "../../generated/prisma/client";
import { lineUtil } from "../../util/lineUtil";

class Moon implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Moon executeSpecialMove");
  }
  async executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> {
    const death = roomSession.room.members.find((member) => {
      if (member.role?.roleName === "DEATH") {
        return true;
      }
      return false;
    });
    if (death) {
      lineUtil.sendSimpleTextMessage(
        death.user?.userId ?? "",
        `DEATH IS ${death.user?.displayName}`
      );
    }
  }
}

export default Moon;
