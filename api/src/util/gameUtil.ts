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
export const gameUtil = {
  defaultSetting,
};
