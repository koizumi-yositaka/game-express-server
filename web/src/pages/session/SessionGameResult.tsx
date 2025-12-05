import { GAME_RESULT_MAP } from "@/common";
import { useLocation } from "react-router-dom";

export const SessionGameResult = () => {
  const { state } = useLocation();
  const result = state?.result;
  return (
    <>
      {result === GAME_RESULT_MAP.KINGDOM_WIN && (
        <div>
          <h2 className="text-xl font-bold">キングダムの勝利</h2>
        </div>
      )}
      {result === GAME_RESULT_MAP.HELL_WIN && (
        <div>
          <h2 className="text-xl font-bold">ヘルの勝利</h2>
        </div>
      )}
      {result === GAME_RESULT_MAP.TOWER_WIN && (
        <div>
          <h2 className="text-xl font-bold">塔の勝利</h2>
        </div>
      )}
    </>
  );
};
