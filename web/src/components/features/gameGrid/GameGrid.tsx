import type { TDirection } from "@/types";

interface GameGridProps {
  size: number;

  direction: TDirection;
  specialCells: [number, number][];
  currentCell: [number, number];
}

const GameGrid = ({
  size,
  direction,
  specialCells,
  currentCell,
}: GameGridProps) => {
  // 特殊マスか判定する関数
  const getCellClassName = (r: number, c: number) => {
    const base = "w-10 h-10 border border-gray-500"; // ← ここでサイズ & 枠線

    if (isSpecialCell(r, c)) return `${base} bg-red-400`;
    if (isCurrentCell(r, c)) return `${base} bg-blue-400`;
    return `${base} bg-gray-300`;
  };

  const getDirectionClass = (direction: TDirection) => {
    switch (direction) {
      case "N":
        return "rotate-0";
      case "E":
        return "rotate-90";
      case "S":
        return "rotate-180";
      case "W":
        return "-rotate-90";
    }
  };
  const isSpecialCell = (r: number, c: number) =>
    specialCells.some(([sr, sc]) => sr === r && sc === c);
  const isCurrentCell = (r: number, c: number) =>
    r === currentCell[0] && c === currentCell[1];

  return (
    <div className="grid grid-cols-7 gap-1 w-fit m-4">
      {Array.from({ length: size }).map((_, row) =>
        Array.from({ length: size }).map((_, col) => (
          <div key={`${row}-${col}`} className={getCellClassName(row, col)}>
            {isCurrentCell(row, col) && (
              <div
                className={`text-white text-2xl ${getDirectionClass(
                  direction
                )}`}
              >
                ▲
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default GameGrid;
