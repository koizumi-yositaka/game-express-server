import {
  TCommand,
  TCommandType,
  TDirection,
  TRole,
  RoomSessionSettingJsonContents,
  TRoomSession,
} from "../domain/types";
import { jsonRW } from "./jsonRW";
import {
  COMMAND_BUTTON_DATA_MAP,
  DEFAULT_SETTING,
  ROLE_NAME_MAP,
} from "../domain/common";
import path from "path";
import { NotFoundError } from "../error/AppError";
import { roleSpecialMoveExecutor } from "../roles/roleSpecialMoveExecutor";
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
        const role = roomSession.room.members.find(
          (member) => member.id === command.memberId
        );
        if (!role) {
          throw new NotFoundError("Role not found");
        }
        roleSpecialMoveExecutor.executeSpecialMove(
          role.role?.roleName as keyof typeof ROLE_NAME_MAP
        );
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
  }
): Promise<CommandButtonData[]> {
  // commandType, displayText,labelを確定
  const gameSetting = await importGameSetting();
  const availableCommands =
    gameSetting.roleSetting[role.roleName as keyof typeof ROLE_NAME_MAP]
      .availableCommands;

  const commandButtonDataList = availableCommands.map((commandType) => {
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
  if (role.roleName === "HIEROPHANT") {
    // TODO protect someone
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

export const gameUtil = {
  DEFAULT_SETTING,
  executeCommand,
  createGameSetting,
  getRoomSettingJsonContents,
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
