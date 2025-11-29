import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoomSession } from "@/api/apiClient";
import type { DTORoomSession } from "@/types";
import { Button } from "@/components/ui/button";
import { GAME_STATUS } from "@/util/common";
import GameGrid from "@/components/features/gameGrid/GameGrid";
import type { DTOCommand } from "@/types";

// まだ実行されていないコマンドのあるメンバーかどうかを判定
const isCommandReceipt = (commands: DTOCommand[], memberId: number) => {
  return commands.some(
    (command) => command.memberId === memberId && !command.processed
  );
};

const SessionDetail = () => {
  const { roomSessionId } = useParams<{ roomSessionId: string }>();

  const {
    data: sessionInfo,
    isLoading,
    error,
  } = useQuery<DTORoomSession | undefined>({
    queryKey: ["session", roomSessionId],
    queryFn: async () => {
      if (!roomSessionId) return undefined;
      return await getRoomSession(Number(roomSessionId));
    },
    enabled: !!roomSessionId,
    refetchInterval: 3000,
  });

  const isAllCommandReceipt = () => {
    return sessionInfo?.room.members.every((member) => {
      return isCommandReceipt(sessionInfo.commands, member.id);
    });
  };

  if (!roomSessionId) {
    return <div className="p-4">セッションIDが指定されていません</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error instanceof Error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!sessionInfo) {
    return <div className="p-4">部屋情報が取得できませんでした</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Room <span className="font-mono">{sessionInfo.room.roomCode}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Status: {sessionInfo.room.status} / Open:{" "}
          {sessionInfo.room.openFlg ? "Yes" : "No"}
        </p>
      </div>
      <div className="text-lg font-bold">Turn: {sessionInfo.turn}</div>

      <div>
        {sessionInfo.room.status === GAME_STATUS.NOT_STARTED && (
          // <Button onClick={startGameHandler}>開始</Button>
          <Button>開始</Button>
        )}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Members</h2>
        {sessionInfo.room.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ誰も参加していません
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {sessionInfo.room.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded border px-3 py-1"
              >
                <span className="font-mono">
                  {member.user?.displayName || member.user?.userId}
                </span>
                {isCommandReceipt(sessionInfo.commands, member.id) ? (
                  <span className="text-xs text-green-500">
                    Command Received
                  </span>
                ) : (
                  <span className="text-xs text-red-500">
                    Command Not Received
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      {isAllCommandReceipt() ? (
        <div className="text-lg font-bold">
          <Button>Reflect Commands</Button>
        </div>
      ) : (
        <div className="text-lg font-bold">Not All Command Received</div>
      )}
      <div className="flex">
        <div className="flex-1">
          <GameGrid
            size={7}
            direction={sessionInfo.direction}
            currentCell={[sessionInfo.posX, sessionInfo.posY]}
            specialCells={[
              [2, 3],
              [4, 1],
            ]}
          />
        </div>
        <div className="flex-1">TODO</div>
      </div>
    </div>
  );
};

export default SessionDetail;
