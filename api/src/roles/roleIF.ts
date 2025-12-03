import { TRoomMember, TRoomSession } from "../domain/types";
abstract class RoleIF {
  abstract executeSpecialMove(): void;
  abstract executeInitialize(me: TRoomMember, roomSession: TRoomSession): void;
}

export default RoleIF;
