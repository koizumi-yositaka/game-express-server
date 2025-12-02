import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getRoomSession, startTurn, stepGameSession } from "@/api/apiClient";
import type { DTORoomSession } from "@/types";
import { Button } from "@/components/ui/button";
import GameGrid from "@/components/features/gameGrid/GameGrid";
import type { DTOCommand } from "@/types";
import { RoomMemberList } from "@/components/features/roomSession/RoomMemberList";
import { useState } from "react";
import { ReceiptCommandList } from "@/components/features/roomSession/ReceiptCommandList";
import { useLoading } from "@/contexts/LoadingContext";

// まだ実行されていないコマンドのあるメンバーかどうかを判定
const isCommandReceipt = (commands: DTOCommand[], memberId: number) => {
  return commands.some(
    (command) => command.memberId === memberId && !command.processed
  );
};

const SessionDetail = () => {
  const { roomSessionId } = useParams<{ roomSessionId: string }>();
  const { show, hide } = useLoading();

  const [turnStatus, setTurnStatus] = useState<
    "command_inputing" | "turn_ended"
  >("command_inputing");
  const [receiptCommandList, setReceiptCommandList] = useState<DTOCommand[]>(
    []
  );
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

  const reflectCommands = async () => {
    try {
      const response = await stepGameSession(Number(roomSessionId));
      show("Reflecting commands...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      hide();
      setReceiptCommandList(response.commands);
      setTurnStatus("turn_ended");
      // await new Promise((resolve) => setTimeout(resolve, 2000));
      // await startTurn(Number(roomSessionId));
    } catch (error) {
      console.error("reflectCommands error:", error);
    }
  };

  const startNextTurn = async () => {
    try {
      await startTurn(Number(roomSessionId));
      show("Starting next turn...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      hide();
      setTurnStatus("command_inputing");
    } catch (error) {
      console.error("startNextTurn error:", error);
    }
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
      </div>
      <div className="text-lg font-bold">Turn: {sessionInfo.turn}</div>

      {turnStatus === "command_inputing" &&
        (isAllCommandReceipt() ? (
          <Button onClick={reflectCommands}>Reflect Commands</Button>
        ) : (
          <div className="text-lg font-bold">Not All Command Received</div>
        ))}

      {turnStatus === "turn_ended" && (
        <Button onClick={startNextTurn}>Next Turn</Button>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          {turnStatus === "turn_ended" ? (
            <ReceiptCommandList
              roomSession={sessionInfo}
              receiptCommandList={receiptCommandList}
            />
          ) : (
            <RoomMemberList roomSession={sessionInfo} />
          )}
        </div>
        <div className="flex-1">
          <GameGrid
            size={7}
            direction={sessionInfo.direction}
            currentCell={[sessionInfo.posX, sessionInfo.posY]}
            specialCells={sessionInfo.setting.specialCells}
            goalCell={sessionInfo.setting.goalCell}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
