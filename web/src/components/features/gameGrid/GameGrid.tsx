import type { TDirection } from "@/types";

interface GameGridProps {
  size: number;

  direction: TDirection;
  specialCells: [number, number][];
  currentCell: [number, number];
  goalCell: [number, number];
}

const GameGrid = ({
  size,
  direction,
  specialCells,
  currentCell,
  goalCell,
}: GameGridProps) => {
  // 特殊マスか判定する関数
  const getCellClassName = (r: number, c: number) => {
    const base =
      "w-10 h-10 border border-gray-500 flex items-center justify-center"; // ← ここでサイズ & 枠線 & 中央配置

    if (isSpecialCell(r, c)) return `${base} bg-red-400`;
    if (isCurrentCell(r, c)) return `${base} bg-blue-400`;
    if (isGoalCell(r, c)) return `${base} bg-green-400`;
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

  const isGoalCell = (r: number, c: number) =>
    r === goalCell[0] && c === goalCell[1];

  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Game Grid</h2>
      <div className="flex m-4 w-fit">
        {/* 左側の行番号 */}
        <div className="flex flex-col mr-1 gap-1">
          <div className="h-8" /> {/* 左上の空白 */}
          {Array.from({ length: size }).map((_, row) => (
            <div
              key={`row-${row}`}
              className="h-10 flex items-center justify-center text-gray-500 text-sm"
            >
              {row + 1}
            </div>
          ))}
        </div>

        <div>
          {/* 上側の列番号 */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {Array.from({ length: size }).map((_, col) => (
              <div
                key={`col-${col}`}
                className="w-10 h-8 flex items-center justify-center text-gray-500 text-sm"
              >
                {col + 1}
              </div>
            ))}
          </div>

          {/* グリッド本体 */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: size }).map((_, col) =>
              Array.from({ length: size }).map((_, row) => (
                <div
                  key={`${row}-${col}`}
                  className={getCellClassName(row, col)}
                >
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
        </div>
      </div>
    </>
  );
};

export default GameGrid;
