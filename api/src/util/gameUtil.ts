import {
  TCommand,
  TCommandType,
  TDirection,
  TRole,
  RoomSessionSettingJsonContents,
} from "../domain/types";
import { jsonRW } from "./jsonRW";
import { COMMAND_BUTTON_DATA_MAP, DEFAULT_SETTING } from "../domain/common";
import path from "path";

type Location = {
  posX: number;
  posY: number;
  direction: TDirection;
};

type GameSetting = {
  roleSetting: Record<number, { availableCommands: TCommandType[] }>;
};

let cachedGameSetting: GameSetting | null = null;

export function executeCommand(
  command: TCommand,
  location: Location,
  goalCell: [number, number],
  maxX: number,
  maxY: number
): Location {
  const { commandType } = command;
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
    gameSetting.roleSetting[role.roleId].availableCommands;
  return availableCommands.map((commandType) => {
    return {
      commandType,
      displayText: COMMAND_BUTTON_DATA_MAP[commandType].displayText,
      label: COMMAND_BUTTON_DATA_MAP[commandType].label,
      formId: meta.formId,
      action: `${actionName}`,
      roomSessionId: meta.roomSessionId,
      memberId: meta.memberId,
      turn: meta.turn,
    };
  });
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
  specialCells: [number, number][] = DEFAULT_SETTING.specialCells,
  goalCell: [number, number] = DEFAULT_SETTING.goalCell,
  initialCell: [number, number] = DEFAULT_SETTING.initialCell,
  initialDirection: TDirection = DEFAULT_SETTING.initialDirection
): RoomSessionSettingJsonContents {
  return {
    size,
    initialCell,
    specialCells,
    goalCell,
    initialDirection,
  };
}

function getRoomSettingJsonContents(
  jsonString: string
): RoomSessionSettingJsonContents {
  return JSON.parse(jsonString) as RoomSessionSettingJsonContents;
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
};
