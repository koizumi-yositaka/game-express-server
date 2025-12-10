import {
  MProofRole,
  ProofList,
  ProofRoom,
  ProofRoomMember,
  ProofRoomSession,
  User,
} from "../../generated/prisma/client";
import {
  ProofRoomSessionWithMembers,
  ProofRoomWithUsers,
  ProofRoomWMemberWithUsers,
} from "../../repos/proofRepository";
import {
  TProofRole,
  TProofRoom,
  TProofRoomMember,
  TUser,
  TProofRoomSession,
  TProof,
} from "./types";
export function toTProofRoom(
  room: ProofRoom,
  members: ProofRoomMember[]
): TProofRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
    members: members,
  };
}

export function toTProofRoomFromProofRoomWithUsers(
  room: ProofRoomWithUsers
): TProofRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
    members: room.members.map((member) =>
      toTProofRoomMemberFromProofRoomMemberWithUsers(member)
    ),
  };
}

export function toTProofRole(role: MProofRole): TProofRole {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    priority: role.priority,
    description: role.description ?? "",
    imageUrl: role.imageUrl ?? "",
    notionUrl: role.notionUrl ?? "",
    group: role.group,
  };
}

export function toTProofRoomMember(
  roomMember: ProofRoomMember
): TProofRoomMember {
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.userId,
    roleId: roomMember.roleId,
    status: roomMember.status,
    sort: roomMember.sort,
    joinedAt: roomMember.joinedAt,
  };
}

// export function toTProofRoomFromRoomWithUsers(
//   room: ProofRoomWithUsers
// ): TProofRoom {
//   return {
//     id: room.id,
//     roomCode: room.roomCode,
//     status: room.status,
//     openFlg: room.openFlg,
//     createdAt: room.createdAt,
//     members: room.members.map((member) =>
//       toTProofRoomMemberFromProofRoomMemberWithUsers(member)
//     ),
//   };
// }

export function toTProofRoomMemberFromProofRoomMemberWithUsers(
  roomMember: ProofRoomWMemberWithUsers
): TProofRoomMember {
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.user.userId,
    roleId: roomMember.role.roleId,
    status: roomMember.status,
    sort: roomMember.sort,
    joinedAt: roomMember.joinedAt,
    user: toTUser(roomMember.user),
    role: toTProofRole(roomMember.role),
  };
}
export function toTUser(user: User): TUser {
  return {
    userId: user.userId,
    displayName: user.displayName,
    invalidateFlg: user.invalidateFlg,
    createdAt: user.createdAt,
  };
}

export function toTProofRoomSessionFromProofRoomSessionWithMembers(
  roomSession: ProofRoomSessionWithMembers
): TProofRoomSession {
  return toTProofRoomSession(
    roomSession,
    roomSession.room,
    roomSession.room.members // これ要らない,
  );
}

export function toTProofRoomSessionFromProofRoomSessionWithUsers(
  roomSession: ProofRoomSession,
  room: ProofRoomWithUsers
): TProofRoomSession {
  return {
    id: roomSession.id,
    roomId: roomSession.roomId,
    turn: roomSession.turn,
    focusOn: roomSession.focusOn,
    status: roomSession.status,
    setting: roomSession.setting,
    room: toTProofRoomFromProofRoomWithUsers(room),
  };
}

export function toTProofRoomSession(
  roomSession: ProofRoomSession,
  room: ProofRoom,
  members: ProofRoomMember[]
): TProofRoomSession {
  return {
    id: roomSession.id,
    roomId: roomSession.roomId,
    turn: roomSession.turn,
    status: roomSession.status,
    setting: roomSession.setting,
    focusOn: roomSession.focusOn,
    room: toTProofRoom(room, members),
  };
}

export function toTProofFromProofList(proofList: ProofList): TProof {
  return {
    id: proofList.id,
    roomSessionId: proofList.roomSessionId,
    code: proofList.code,
    rank: proofList.rank,
    status: proofList.status,
    title: proofList.title,
    description: proofList.description,
    revealedBy:
      proofList.revealedBy
        .split(",")
        .filter((id) => id !== "" && id !== null && id !== undefined)
        .map((id) => Number(id)) ?? [],
  };
}
