import {
  MRole,
  Room,
  User,
  RoomMember,
  RoomSession,
  Command,
  CommandHistory,
} from "../generated/prisma/client";
import {
  TRoom,
  TRoomMember,
  TUser,
  TRole,
  TRoomSession,
  TCommand,
  TCommandHistory,
} from "./types";
import { RoomWithUsers } from "../repos/roomRepository";
import { RoomMemberWithUsers } from "../repos/roomMemberRepository";
import { RoomSessionWithMembersAndCommands } from "../repos/roomSessionRepository";
import { CommandHistoryWithCommandAndMember } from "../repos/commandRepository";

export function toTRoom(room: Room, members: RoomMember[]): TRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
    members: members,
  };
}

export function toTRoomFromRoomWithUsers(room: RoomWithUsers): TRoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt,
    members: room.members.map((member) =>
      toTRoomMemberFromRoomMemberWithUsers(member)
    ),
  };
}

export function toTRole(role: MRole): TRole {
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

export function toTRoomMember(roomMember: RoomMember): TRoomMember {
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.userId,
    roleId: roomMember.roleId,
    status: roomMember.status,
    joinedAt: roomMember.joinedAt,
  };
}

export function toTRoomMemberFromRoomMemberWithUsers(
  roomMember: RoomMemberWithUsers
): TRoomMember {
  return {
    id: roomMember.id,
    roomId: roomMember.roomId,
    userId: roomMember.user.userId,
    roleId: roomMember.role.roleId,
    status: roomMember.status,
    joinedAt: roomMember.joinedAt,
    user: toTUser(roomMember.user),
    role: toTRole(roomMember.role),
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

// 渡し方に工夫必要
export function toTRoomSessionFromRoomSessionWithMembers(
  roomSession: RoomSessionWithMembersAndCommands
): TRoomSession {
  return toTRoomSession(
    roomSession,
    roomSession.room,
    roomSession.room.members, // これ要らない,
    roomSession.commands
  );
}

export function toTRoomSession(
  roomSession: RoomSession,
  room: Room,
  members: RoomMember[],
  commands: Command[]
): TRoomSession {
  return {
    id: roomSession.id,
    roomId: roomSession.roomId,
    posX: roomSession.posX,
    posY: roomSession.posY,
    turn: roomSession.turn,
    direction: roomSession.direction,
    status: roomSession.status,
    setting: roomSession.setting,
    room: toTRoom(room, members),
    commands: commands.map((command) => toTCommand(command)),
  };
}

export function toTRoomSessionFromRoomSessionWithUsers(
  roomSession: RoomSession,
  room: RoomWithUsers,
  commands: Command[]
): TRoomSession {
  return {
    id: roomSession.id,
    roomId: roomSession.roomId,
    posX: roomSession.posX,
    posY: roomSession.posY,
    turn: roomSession.turn,
    direction: roomSession.direction,
    status: roomSession.status,
    setting: roomSession.setting,
    room: toTRoomFromRoomWithUsers(room),
    commands: commands.map((command) => toTCommand(command)),
  };
}

export function toTCommand(command: Command): TCommand {
  return {
    id: command.id,
    roomSessionId: command.roomSessionId,
    memberId: command.memberId,
    commandType: command.commandType,
    processed: command.processed,
    arg: command.arg,
  };
}

export function toTCommandHistory(
  commandHistory: CommandHistoryWithCommandAndMember
): TCommandHistory {
  return {
    id: commandHistory.id,
    roomSessionId: commandHistory.roomSessionId,
    memberId: commandHistory.memberId,
    commandId: commandHistory.commandId,
    turn: commandHistory.turn,
    arg: commandHistory.arg,
    command: toTCommand(commandHistory.command),
  };
}
