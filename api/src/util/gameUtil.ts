import {
  TCommand,
  TCommandType,
  TDirection,
  TRole,
  RoomSessionSettingJsonContents,
  TRoomSession,
  TRoomMember,
} from "../domain/types";
import { jsonRW } from "./jsonRW";
import { RoomSessionWithMembersAndCommands } from "../repos/roomSessionRepository";
import {
  COMMAND_BUTTON_DATA_MAP,
  DEFAULT_SETTING,
  ROLE_NAME_MAP,
  ROOM_MEMBER_STATUS,
  SPECIAL_COMMAND_MAP,
  GAME_STATUS,
} from "../domain/common";
import path from "path";
import { BadRequestError, NotFoundError } from "../error/AppError";
import { roleSpecialMoveExecutor } from "../roles/roleSpecialMoveExecutor";
import { Prisma } from "../generated/prisma/client";
import { roleMasterService } from "../services/roleMasterService";
type Location = {
  posX: number;
  posY: number;
  direction: TDirection;
};

type GameSetting = {
  roleSetting: Record<
    keyof typeof ROLE_NAME_MAP,
    { availableCommands: TCommandType[] }
  >;
};

let cachedGameSetting: GameSetting | null = null;

export async function executeSpecialCommand(
  command: TCommand,
  gridInfo: {
    location: Location;
    goalCell: [number, number][];
    maxX: number;
    maxY: number;
  },
  tx: Prisma.TransactionClient,
  roomSession: TRoomSession
): Promise<void> {
  const { commandType } = command;
  const { location, goalCell, maxX, maxY } = gridInfo;
  let { posX, posY, direction } = location;
  const role = roomSession.room.members.find(
    (member) => member.id === command.memberId
  );
  if (!role) {
    throw new NotFoundError("Role not found");
  }
  await roleSpecialMoveExecutor.executeSpecialMove(
    role.role?.roleName as keyof typeof ROLE_NAME_MAP,
    tx,
    command,
    roomSession
  );
}

export function executeCommand(
  command: TCommand,
  gridInfo: {
    location: Location;
    goalCell: [number, number][];
    maxX: number;
    maxY: number;
  },
  roomSession: TRoomSession
): Location {
  const { commandType } = command;
  const { location, goalCell, maxX, maxY } = gridInfo;
  let { posX, posY, direction } = location;

  if (commandType.startsWith("TURN_")) {
    switch (commandType) {
      case "TURN_RIGHT":
        direction =
          direction === "N"
            ? "E"
            : direction === "E"
            ? "S"
            : direction === "S"
            ? "W"
            : "N";
        break;
      case "TURN_LEFT":
        direction =
          direction === "N"
            ? "W"
            : direction === "W"
            ? "S"
            : direction === "S"
            ? "E"
            : "N";
        break;
      default:
        direction = "N";
    }
  } else {
    switch (commandType) {
      case "SPECIAL":
        break;
      case "SKIP":
        break;
      case "FORWARD":
        switch (direction) {
          case "N":
            if (posY - 1 < 0) break;
            posY -= 1;
            break;
          case "S":
            if (posY + 1 > maxY - 1) break;
            posY += 1;
            break;
          case "E":
            if (posX + 1 > maxX - 1) break;
            posX += 1;
            break;
          case "W":
            if (posX - 1 < 0) break;
            posX -= 1;
            break;
        }
        break;
      default:
        break;
    }
  }
  console.log("実行前", location);
  console.log("実行後", { posX, posY, direction });

  return {
    posX,
    posY,
    direction,
  };
}

export async function getAvailableCommandsByRole(
  role: TRole,
  actionName: string,
  meta: {
    formId: string;
    roomSessionId: number;
    memberId: number;
    turn: number;
  },
  members: TRoomMember[],
  me: TRoomMember
): Promise<CommandButtonData[]> {
  // commandType, displayText,labelを確定
  const gameSetting = await importGameSetting();
  const availableCommands =
    gameSetting.roleSetting[role.roleName as keyof typeof ROLE_NAME_MAP]
      .availableCommands;

  // 基本のコマンドリスト
  let commandButtonDataList = availableCommands.map((commandType) => {
    return {
      commandType,
      displayText: COMMAND_BUTTON_DATA_MAP[commandType].displayText,
      label: COMMAND_BUTTON_DATA_MAP[commandType].label,
      formId: meta.formId,
      action: `${actionName}`,
      roomSessionId: meta.roomSessionId,
      memberId: meta.memberId,
      turn: meta.turn,
      arg: "",
    };
  });

  // BLOCKされている場合はSKIPのみ
  console.log("me.status", me.user?.displayName, me.status);
  if (me.status === ROOM_MEMBER_STATUS.BLOCKED) {
    console.log("BLOCKされている場合はSKIPのみ");
    commandButtonDataList = commandButtonDataList.filter(
      (command) => command.commandType === "SKIP"
    );
  } else {
    if (role.roleName === "HIEROPHANT") {
      commandButtonDataList = commandButtonDataList.filter(
        (command) => command.commandType !== "SPECIAL"
      );
      members
        .filter((member) => member.id !== me.id)
        .forEach((member) => {
          commandButtonDataList.push({
            commandType: "SPECIAL",
            displayText: SPECIAL_COMMAND_MAP[
              role.roleName as keyof typeof ROLE_NAME_MAP
            ].displayText.replace(
              "${userName}",
              member.user?.displayName ?? ""
            ),
            label: SPECIAL_COMMAND_MAP[
              role.roleName as keyof typeof ROLE_NAME_MAP
            ].label.replace("${userName}", member.user?.displayName ?? ""),
            formId: meta.formId,
            action: `${actionName}`,
            roomSessionId: meta.roomSessionId,
            memberId: meta.memberId,
            turn: meta.turn,
            arg: member.id.toString(),
          });
        });
    }
  }

  return commandButtonDataList;
}

async function importGameSetting(): Promise<GameSetting> {
  if (cachedGameSetting) {
    return cachedGameSetting;
  }
  // __dirname は dist/util/ または src/util/ を指す
  // ビルド後は dist/util/ になるので、dist/data/ を参照
  const filePath = path.join(__dirname, "../data/game-setting.json");
  const gameSetting = await jsonRW.readJson<GameSetting>(filePath);
  cachedGameSetting = gameSetting;
  return gameSetting;
}

function createGameSetting(
  size: number = DEFAULT_SETTING.size,
  initialCell: [number, number] = DEFAULT_SETTING.initialCell,
  initialDirection: TDirection = DEFAULT_SETTING.initialDirection,
  specialCells?: [number, number][]
): RoomSessionSettingJsonContents {
  return {
    size,
    initialCell,
    specialCells: specialCells
      ? specialCells
      : _getRandomSecondOuterRingCoordinate(size, 2),
    goalCell: _getRandomCoordinateOfCorners(size),
    initialDirection,
  };
}

function getRoomSettingJsonContents(
  jsonString: string
): RoomSessionSettingJsonContents {
  return JSON.parse(jsonString) as RoomSessionSettingJsonContents;
}

function getRandomKingdomMember(roomMembers: TRoomMember[]) {
  const kingdomMembers = roomMembers.filter(
    (member) => member.role?.group === 1 && member.role?.roleName !== "EMPEROR"
  );
  if (kingdomMembers.length === 0) {
    return null;
  }
  const randomIndex = Math.floor(Math.random() * kingdomMembers.length);
  return kingdomMembers[randomIndex];
}

function _getRandomCoordinateOfCorners(size: number): [number, number][] {
  // const coordinates: [number, number][] = [
  //   [0, 0],

  //   [size - 1, size - 1],
  // ];
  // const randomCoordinate =
  //   coordinates[Math.floor(Math.random() * coordinates.length)];
  // return randomCoordinate;
  return [
    [0, 0],
    [size - 1, size - 1],
  ];
}

function _getRandomSecondOuterRingCoordinate(
  size: number,
  length: number
): [number, number][] {
  const coordinates: [number, number][] = [];
  const result: [number, number][] = [];
  for (let x = 0; x < size; x++) {
    for (let y = 0; y < size; y++) {
      // 外から2つ目の条件
      if (x === 1 || y === 1 || x === size - 2 || y === size - 2) {
        // ただし一番外側は除く
        if (x > 0 && x < size - 1 && y > 0 && y < size - 1) {
          coordinates.push([x, y]);
        }
      }
    }
  }
  console.log("coordinates", coordinates);
  for (let i = 0; i < length; i++) {
    const idx = Math.floor(Math.random() * coordinates.length);
    result.push(coordinates[idx]);
    coordinates.splice(idx, 1);
  }
  return result;
}

function assignRoles(
  roomMembers: TRoomMember[],
  roles: TRole[]
): TRoomMember[] {
  let assignedRoles: TRole[] = [];
  const role_EMPEROR = roles.find((role) => role.roleName === "EMPEROR");
  const role_DEATH = roles.find((role) => role.roleName === "DEATH");
  const role_HIEROPHANT = roles.find((role) => role.roleName === "HIEROPHANT");
  const role_FOOL = roles.find((role) => role.roleName === "FOOL");
  const role_THE_TOWER = roles.find((role) => role.roleName === "THE_TOWER");
  const role_SUN = roles.find((role) => role.roleName === "SUN");
  const role_MOON = roles.find((role) => role.roleName === "MOON");
  if (
    !role_EMPEROR ||
    !role_DEATH ||
    !role_HIEROPHANT ||
    !role_FOOL ||
    !role_THE_TOWER ||
    !role_SUN ||
    !role_MOON
  ) {
    throw new NotFoundError("Role not found");
  }

  const baseRoles = [role_EMPEROR, role_DEATH, role_HIEROPHANT, role_FOOL];
  const resultMembers: TRoomMember[] = shuffleArray(roomMembers);
  // ４人以下の場合　というか４人の場合
  if (roomMembers.length <= 4) {
    assignedRoles = baseRoles;
  } else if (roomMembers.length === 5) {
    assignedRoles = [...baseRoles, role_MOON];
  } else if (roomMembers.length === 6) {
    assignedRoles = [...baseRoles, role_MOON, role_SUN];
  } else if (roomMembers.length === 7) {
    assignedRoles = [...baseRoles, role_MOON, role_SUN, role_THE_TOWER];
  }
  resultMembers.forEach((member, index) => {
    member.roleId = assignedRoles[index].roleId;
    member.role = assignedRoles[index];
  });
  return resultMembers;
}
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // 元の配列を破壊しない
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0〜i のランダムな整数
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  console.log("shuffledArray", arr);
  return arr;
}

function roomSessionChecker(roomSession: RoomSessionWithMembersAndCommands) {
  if (!roomSession.room.openFlg) {
    throw new BadRequestError("Room is not Open");
  }

  if (
    roomSession.status === GAME_STATUS.COMPLETED_GOAL ||
    roomSession.status === GAME_STATUS.COMPLETED_NOT_GOAL
  ) {
    throw new BadRequestError("Game is completed");
  }
}
export const gameUtil = {
  DEFAULT_SETTING,
  executeCommand,
  executeSpecialCommand,
  getRandomKingdomMember,
  createGameSetting,
  getRoomSettingJsonContents,
  assignRoles,
  shuffleArray,
  roomSessionChecker,
};

// buttonに必要なデータ
export type CommandButtonData = {
  formId: string;
  action: string;
  roomSessionId: number;
  memberId: number;
  commandType: TCommandType;
  turn: number;
  displayText: string;
  label: string;
  arg: string;
};
