import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoomMembers } from "@/api/apiClient";
import type { DTORoomMembers } from "@/types";
import { Button } from "@/components/ui/button";
import { GAME_STATUS } from "@/util/common";

const RoomDetail = () => {
  const { roomCode } = useParams<{ roomCode: string }>();

  const {
    data: roomMembers,
    isLoading,
    error,
  } = useQuery<DTORoomMembers | undefined>({
    queryKey: ["roomMembers", roomCode],
    queryFn: async () => {
      if (!roomCode) return undefined;
      return await getRoomMembers(roomCode);
    },
    enabled: !!roomCode,
    refetchInterval: 3000,
  });

  if (!roomCode) {
    return <div className="p-4">ルームコードが指定されていません</div>;
  }

  if (isLoading) {
    return <div className="p-4">Loading...</div>;
  }

  if (error instanceof Error) {
    return <div className="p-4 text-red-500">Error: {error.message}</div>;
  }

  if (!roomMembers) {
    return <div className="p-4">部屋情報が取得できませんでした</div>;
  }

  const { room, members } = roomMembers;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Room <span className="font-mono">{room.roomCode}</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          Status: {room.status} / Open: {room.openFlg ? "Yes" : "No"}
        </p>
      </div>

      <div>
        {room.status === GAME_STATUS.NOT_STARTED && <Button>開始</Button>}
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            まだ誰も参加していません
          </p>
        ) : (
          <ul className="space-y-1 text-sm">
            {members.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between rounded border px-3 py-1"
              >
                <span className="font-mono">
                  {m.user?.displayName || m.userId}
                </span>
                <span className="text-xs text-muted-foreground">
                  roleId: {m.roleId}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RoomDetail;
