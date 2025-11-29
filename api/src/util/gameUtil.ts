import { TCommand, TDirection } from "../domain/types";
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
export const gameUtil = {
  defaultSetting,
  executeCommand,
};
