import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoomByRoomCode, startGame, startTurn } from "@/api/apiClient";
import type { DTORoom } from "@/types";
import { Button } from "@/components/ui/button";
import { GAME_STATUS } from "@/util/common";
import { useLoading } from "@/contexts/LoadingContext";
const RoomPrepare = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const {
    data: roomInfo,
    isLoading,
    error,
  } = useQuery<DTORoom | undefined>({
    queryKey: ["room", roomCode],
    queryFn: async () => {
      if (!roomCode) return undefined;
      return await getRoomByRoomCode(roomCode);
    },
    enabled: !!roomCode,
    refetchInterval: 3000,
  });

  const startGameHandler = async () => {
    try {
      show("Starting game...");
      if (!roomCode) return;
      const roomSession = await startGame(roomCode);
      await startTurn(roomSession.id);
      navigate(`/session/${roomSession.id}`);
    } catch (error) {
      console.error("startGame error:", error);
    } finally {
      hide();
    }
  };
  if (!roomCode) {
    return <div className="p-4">ルームコードが指定されていません</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error instanceof Error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!roomInfo) {
    return <div className="p-4">部屋情報が取得できませんでした</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Room <span className="font-mono">{roomInfo.roomCode}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Status: {roomInfo.status} / Open: {roomInfo.openFlg ? "Yes" : "No"}
        </p>
      </div>

      <div>
        {roomInfo.status === GAME_STATUS.NOT_STARTED &&
          roomInfo.members.length > 0 && (
            <Button onClick={startGameHandler}>開始</Button>
          )}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Members</h2>
        {roomInfo.members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ誰も参加していません
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {roomInfo.members.map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded border px-3 py-1"
              >
                <span className="font-mono">
                  {member.user?.displayName || member.user?.userId}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoomPrepare;
