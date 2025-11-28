import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoomByRoomCode } from "@/api/apiClient";
import type { DTORoom } from "@/types";
import { Button } from "@/components/ui/button";
import { GAME_STATUS } from "@/util/common";
import GameGrid from "@/components/features/gameGrid/GameGrid";
import { useState } from "react";

const RoomDetail = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const [currentCell] = useState<[number, number]>([0, 0]);
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

  // const startGameHandler = async () => {
  //   try {
  //     if (!roomCode || !roomMembers?.room.id) return;
  //     const roomAndMembers = await startGame(roomCode);
  //     setRoomSession(roomAndMembers.roomSession);
  //   } catch (error) {
  //     console.error("startGame error:", error);
  //   }
  // };
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
        {roomInfo.status === GAME_STATUS.NOT_STARTED && (
          // <Button onClick={startGameHandler}>開始</Button>
          <Button>開始</Button>
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
                <span className="text-xs text-muted-foreground">
                  roleId: {member.role?.roleId}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <GameGrid
        size={7}
        currentCell={currentCell}
        specialCells={[
          [2, 3],
          [4, 1],
        ]}
      />
    </div>
  );
};

export default RoomDetail;
