import RoleIF from "../roleIF";
import { TCommand, TRoomMember, TRoomSession } from "../../domain/types";
import { Prisma } from "../../generated/prisma/client";
import { roomMemberRepository } from "../../repos/roomMemberRepository";
import { ROOM_MEMBER_STATUS } from "../../domain/common";
class Hierophant implements RoleIF {
  async executeSpecialMove(
    tx: Prisma.TransactionClient,
    command: TCommand,
    roomSession: TRoomSession
  ): Promise<void> {
    // memberIdが指定される
    console.log("Hierophant executeSpecialMove", command.arg);
    const memberId = parseInt(command.arg);
    const member = roomSession.room.members.find(
      (member) => member.id === memberId
    );
    if (!member) {
      throw new Error("Member not found");
    }
    await roomMemberRepository.updateRoomMemberStatus(
      tx,
      roomSession.roomId,
      member.userId,
      ROOM_MEMBER_STATUS.BLOCKED
    );
  }
  async executeInitialize(
    me: TRoomMember,
    roomSession: TRoomSession
  ): Promise<void> {
    console.log("Hierophant executeInitialize");
    return;
  }
}

export default Hierophant;
