import {
  TProofRoomMember,
  TProofRoomSession,
  TUser,
  TProofRole,
  TProofRoom,
  TProof,
} from "../../domain/proof/types";
import {
  DTOProofRole,
  DTOProofRoom,
  DTOProofRoomMember,
  DTOProofRoomSession,
  DTOProofUser,
  DTOProof,
} from "./dto";

export function toDTOProofRoomMember(
  roomMember: TProofRoomMember
): DTOProofRoomMember {
  return {
    id: roomMember.id,
    sort: roomMember.sort,
    status: roomMember.status,
    skillUsedTime: roomMember.skillUsedTime,
    isSkillUsed: roomMember.isSkillUsed,
    penalty: roomMember.penalty,
    joinedAt: roomMember.joinedAt.toISOString(),
    user: roomMember.user ? toDTOProofUser(roomMember.user) : null,
    role: roomMember.role ? toDTOProofRole(roomMember.role) : null,
  };
}
export function toDTOProofRole(role: TProofRole): DTOProofRole {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    priority: role.priority,
    description: role.description,
    imageUrl: role.imageUrl,
    notionUrl: role.notionUrl,
    group: role.group,
  };
}

export function toDTOProofRoom(room: TProofRoom): DTOProofRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt.toISOString(),
    members: room.members.map((member) => toDTOProofRoomMember(member)),
  };
}

export function toDTOProofRoomSession(
  roomSession: TProofRoomSession
): DTOProofRoomSession {
  return {
    id: roomSession.id,
    status: roomSession.status,
    turn: roomSession.turn,
    focusOn: roomSession.focusOn,
    room: toDTOProofRoom(roomSession.room),
  };
}
export function toDTOProofUser(user: TUser): DTOProofUser {
  return {
    userId: user.userId,
    displayName: user.displayName,
    invalidateFlg: user.invalidateFlg,
    createdAt: user.createdAt?.toISOString() ?? "",
  };
}

export function toDTOProof(proof: TProof): DTOProof {
  return {
    id: proof.id,
    roomSessionId: proof.roomSessionId,
    code: proof.code,
    refer: proof.refer,
    bomFlg: proof.bomFlg,
    rank: proof.rank,
    status: proof.status,
    title: proof.title,
    description: proof.description,
    revealedTurn: proof.revealedTurn,
    revealedBy: proof.revealedBy,
  };
}
