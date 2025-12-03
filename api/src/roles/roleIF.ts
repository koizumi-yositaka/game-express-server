import { TRoomSession } from "../domain/types";
abstract class RoleIF {
  abstract executeSpecialMove(): void;
  abstract executeInitialize(roomSession: TRoomSession): void;
}

export default RoleIF;
