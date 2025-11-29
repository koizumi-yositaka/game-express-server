import { TCommandType } from "./types";

const GAME_STATUS = Object.freeze({
  NOT_STARTED: 0,
  IN_PROGRESS: 1,
  COMPLETED: 2,
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
    displayText: "右に曲がる",
    label: "右に曲がる",
  },
});

export { GAME_STATUS, IMAGE_PATH_MAP, COMMAND_BUTTON_DATA_MAP };
