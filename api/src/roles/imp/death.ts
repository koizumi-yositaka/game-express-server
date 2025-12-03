import RoleIF from "../roleIF";
import { TRoomSession } from "../../domain/types";

class Death implements RoleIF {
  executeSpecialMove(): void {
    console.log("Death executeSpecialMove");
  }
  executeInitialize(roomSession: TRoomSession): void {
    console.log("Death executeInitialize");
    return;
  }
}

export default Death;
