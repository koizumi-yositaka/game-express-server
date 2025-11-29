import {
  TCommand,
  TCommandType,
  TDirection,
  TRole,
  TUser,
} from "../domain/types";
import { jsonRW } from "./jsonRW";
import { COMMAND_BUTTON_DATA_MAP } from "../domain/common";
import path from "path";
type Location = {
  posX: number;
  posY: number;
  direction: TDirection;
};
type TSetting = {
  size: number;
  specialCells: [number, number][];
  currentCell: [number, number];
};

type GameSetting = {
  roleSetting: Record<number, { availableCommands: TCommandType[] }>;
};

let cachedGameSetting: GameSetting | null = null;

const defaultSetting: TSetting = {
  size: 7,
  currentCell: [0, 0],
  specialCells: [
    [2, 3],
    [4, 1],
  ],
};

export function executeCommand(
  command: TCommand,
  location: Location,
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
      default:
        direction = "N";
    }
  } else {
    switch (commandType) {
      case "FORWARD":
        switch (direction) {
          case "N":
            if (posY + 1 > maxY - 1) break;
            posY += 1;
            break;
          case "E":
            if (posX + 1 > maxX - 1) break;
            posX += 1;
            break;
          case "S":
            if (posY - 1 < 0) break;
            posY -= 1;
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
  console.log("availableCommands", availableCommands);
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
  const gameSetting = await jsonRW.readJson<GameSetting>(
    path.join(__dirname, "../data/game-setting.json")
  );
  cachedGameSetting = gameSetting;
  return gameSetting;
}

export const gameUtil = {
  defaultSetting,
  executeCommand,
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
