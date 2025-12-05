import { RoomSessionSettingJsonContents, TCommandType } from "./types";

const GAME_STATUS = Object.freeze({
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED_GOAL: 2,
  COMPLETED_NOT_GOAL: 3,
});

const IMAGE_PATH_MAP = Object.freeze({
  FOX: `https://d1z1o17j25srna.cloudfront.net/fox.png`,
});

const ROLE_MAP = Object.freeze({
  ROLE_1: 1,
  ROLE_2: 2,
});

const COMMAND_BUTTON_DATA_MAP: Record<
  TCommandType,
  { displayText: string; label: string; commandType: TCommandType }
> = Object.freeze({
  FORWARD: {
    commandType: "FORWARD",
    displayText: "直進",
    label: "直進",
  },
  TURN_RIGHT: {
    commandType: "TURN_RIGHT",
    displayText: "右を向く",
    label: "右を向く",
  },
  TURN_LEFT: {
    commandType: "TURN_LEFT",
    displayText: "左を向く",
    label: "左を向く",
  },
  SPECIAL: {
    commandType: "SPECIAL",
    displayText: "特殊",
    label: "特殊",
  },
  SKIP: {
    commandType: "SKIP",
    displayText: "スキップ",
    label: "スキップ",
  },
});

export const ROLE_NAME_MAP = {
  EMPEROR: "EMPEROR",
  DEATH: "DEATH",
  HIEROPHANT: "HIEROPHANT",
  FOOL: "FOOL",
  THE_TOWER: "THE_TOWER",
  SUN: "SUN",
  MOON: "MOON",
};

export const SPECIAL_COMMAND_MAP: Record<
  keyof typeof ROLE_NAME_MAP,
  { displayText: string; label: string }
> = Object.freeze({
  EMPEROR: {
    displayText: "",
    label: "",
  },
  DEATH: {
    displayText: "",
    label: "",
  },
  HIEROPHANT: {
    displayText: "${userName}の行動妨害",
    label: "${userName}の行動妨害",
  },
  FOOL: {
    displayText: "",
    label: "",
  },
  THE_TOWER: {
    displayText: "",
    label: "",
  },
  SUN: {
    displayText: "",
    label: "",
  },
  MOON: {
    displayText: "",
    label: "",
  },
});
export const ROLE_GROUP_MAP = Object.freeze({
  KINGDOM: 1,
  HELL: 2,
  TOWER: 3,
});
const DEFAULT_SETTING: RoomSessionSettingJsonContents = {
  size: 7,
  initialCell: [3, 3],
  initialDirection: "N",
  specialCells: [
    [2, 3],
    [4, 1],
  ],
  goalCell: [
    [0, 0],
    [7, 7],
  ],
};

export const ROOM_MEMBER_STATUS = Object.freeze({
  ACTIVE: 0,
  SKILL_USED: 1,
  BLOCKED: 2,
});

export const GAME_RESULT_MAP = Object.freeze({
  KINGDOM_WIN: 1,
  HELL_WIN: 2,
  TOWER_WIN: 3,
});
export {
  GAME_STATUS,
  IMAGE_PATH_MAP,
  COMMAND_BUTTON_DATA_MAP,
  DEFAULT_SETTING,
};
