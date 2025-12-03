import RoleIF from "../roleIF";
import { TRoomMember, TRoomSession } from "../../domain/types";

class Death implements RoleIF {
  executeSpecialMove(): void {
    console.log("Death executeSpecialMove");
  }
  executeInitialize(me: TRoomMember, roomSession: TRoomSession): void {
    console.log("Death executeInitialize");
    return;
  }
}

export default Death;
