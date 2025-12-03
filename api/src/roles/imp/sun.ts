import RoleIF from "../roleIF";
import { TRoomMember, TRoomSession } from "../../domain/types";
import { lineUtil } from "../../util/lineUtil";

class Death implements RoleIF {
  executeSpecialMove(): void {
    console.log("Death executeSpecialMove");
  }
  executeInitialize(me: TRoomMember, roomSession: TRoomSession): void {
    const emperor = roomSession.room.members.find((member) => {
      if (member.role?.roleName === "EMPEROR") {
        return true;
      }
      return false;
    });
    if (emperor) {
      lineUtil.sendSimpleTextMessage(
        emperor.user?.userId ?? "",
        `EMPEROR IS ${emperor.user?.displayName}`
      );
    }
  }
}
export default Death;
