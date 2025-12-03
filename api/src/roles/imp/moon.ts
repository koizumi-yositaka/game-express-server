import RoleIF from "../roleIF";
import { TRoomMember, TRoomSession } from "../../domain/types";
import { lineUtil } from "../../util/lineUtil";

class Death implements RoleIF {
  executeSpecialMove(): void {
    console.log("Death executeSpecialMove");
  }
  executeInitialize(me: TRoomMember, roomSession: TRoomSession): void {
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

export default Death;
