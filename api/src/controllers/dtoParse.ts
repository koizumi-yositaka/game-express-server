import {
  TRoom,
  TRoomMember,
  TUser,
  TRole,
  TRoomSession,
  TCommand,
  RoomSessionSettingJsonContents,
  TCommandHistory,
} from "../domain/types";
import {
  DTORoom,
  DTORoomMember,
  DTOUser,
  DTORoomSession,
  DTOCommand,
  DTOCommandHistory,
} from "./dto";
export function toDTORoomMember(roomMember: TRoomMember): DTORoomMember {
  return {
    id: roomMember.id,
    joinedAt: roomMember.joinedAt.toISOString(),
    user: roomMember.user ? toDTOUser(roomMember.user) : null,
    role: roomMember.role ? toTRole(roomMember.role) : null,
  };
}
export function toDTOUser(user: TUser): DTOUser {
  return {
    userId: user.userId,
    displayName: user.displayName,
    invalidateFlg: user.invalidateFlg,
    createdAt: user.createdAt?.toISOString() ?? "",
  };
}

export function toDTORoom(room: TRoom): DTORoom {
  return {
    id: room.id,
    roomCode: room.roomCode,
    status: room.status,
    openFlg: room.openFlg,
    createdAt: room.createdAt.toISOString(),
    members: room.members.map((member) => toDTORoomMember(member)),
  };
}

export function toDTOCommand(command: TCommand): DTOCommand {
  return {
    id: command.id ?? 0,
    memberId: command.memberId,
    commandType: command.commandType,
    processed: command.processed,
  };
}

export function toDTOCommandHistory(
  commandHistory: TCommandHistory
): DTOCommandHistory {
  return {
    id: commandHistory.id,
    roomSessionId: commandHistory.roomSessionId,
    memberId: commandHistory.memberId,
    commandId: commandHistory.commandId,
    turn: commandHistory.turn,
    command: toDTOCommand(commandHistory.command),
  };
}
export function toDTORoomSession(roomSession: TRoomSession): DTORoomSession {
  return {
    id: roomSession.id,
    posX: roomSession.posX,
    posY: roomSession.posY,
    direction: roomSession.direction,
    turn: roomSession.turn,
    setting: JSON.parse(roomSession.setting) as RoomSessionSettingJsonContents,
    room: toDTORoom(roomSession.room),
    commands: roomSession.commands.map((command) => toDTOCommand(command)),
  };
}

// 消したい
export function toTRole(role: TRole): TRole {
  return {
    roleId: role.roleId,
    roleName: role.roleName,
    priority: role.priority,
    description: role.description,
    imageUrl: role.imageUrl,
    notionUrl: role.notionUrl,
  };
}
