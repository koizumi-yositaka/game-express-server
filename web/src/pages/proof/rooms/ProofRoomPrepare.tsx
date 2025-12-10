import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProofRoomByRoomCode, startProofGame } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { GAME_STATUS } from "@/util/common";
import { useLoading } from "@/contexts/LoadingContext";
import type { DTOProofRoom } from "@/proofTypes";
import { useAuthSocket } from "@/hooks/useSocket";
const ProofRoomPrepare = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { isConnected } = useAuthSocket();
  const navigate = useNavigate();
  const { show, hide } = useLoading();
  const {
    data: roomInfo,
    isLoading,
    error,
  } = useQuery<DTOProofRoom | undefined>({
    queryKey: ["proofRoom", roomCode],
    queryFn: async () => {
      if (!roomCode) return undefined;
      return await getProofRoomByRoomCode(roomCode);
    },
    enabled: !!roomCode,
    refetchInterval: 3000,
  });

  const startGameHandler = async () => {
    try {
      show("Starting game...");
      if (!roomCode) return;
      const roomSession = await startProofGame(roomCode);

      navigate(`/proof/session/${roomSession.id}`);
    } catch (error) {
      console.error("startGame error:", error);
    } finally {
      hide();
    }
  };
  if (!roomCode) {
    return <div className="p-4">ルームコードが指定されていません</div>;
  }
  if (!isConnected) {
    return <div className="p-4">Socket接続中...</div>;
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

export default ProofRoomPrepare;
