import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { gameComplete, getRoomSession } from "@/api/apiClient";
import {
  GAME_RESULT_MAP,
  GAME_STATUS,
  ROLE_GROUP_MAP,
  ROLE_NAME_MAP,
} from "@/common";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export const SessionComplete = () => {
  const { roomSessionId } = useParams();
  const [emperorId, setEmperorId] = useState<string>("");
  const navigate = useNavigate();
  const {
    data: sessionInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["session", roomSessionId],
    queryFn: () => getRoomSession(Number(roomSessionId)),
    enabled: !!roomSessionId,
  });
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  const deathMember = sessionInfo?.room.members.find(
    (member) => member.role?.roleName === ROLE_NAME_MAP.DEATH
  );
  const emperorMember = sessionInfo?.room.members.find(
    (member) => member.role?.roleName === ROLE_NAME_MAP.EMPEROR
  );
  const checkResult = async () => {
    let result = 0;
    if (
      emperorId === emperorMember?.id.toString() ||
      (sessionInfo?.status === GAME_STATUS.COMPLETED_NOT_GOAL &&
        !sessionInfo?.room.members.some(
          (member) => member.role?.group === ROLE_GROUP_MAP.TOWER
        ))
    ) {
      result = GAME_RESULT_MAP.HELL_WIN;
    } else {
      if (sessionInfo?.status === GAME_STATUS.COMPLETED_GOAL) {
        result = GAME_RESULT_MAP.KINGDOM_WIN;
      } else {
        result = GAME_RESULT_MAP.TOWER_WIN;
      }
    }
    await gameComplete(Number(roomSessionId), result);
    navigate(`/session/result`, { state: { result } });
  };
  return (
    <div>
      <h1 className="text-2xl font-bold">ゲームが完了しました</h1>
      {sessionInfo?.status === GAME_STATUS.COMPLETED_GOAL && (
        <div>
          <h2 className="text-xl font-bold">ゴールに到達しました</h2>
        </div>
      )}
      {sessionInfo?.status === GAME_STATUS.COMPLETED_NOT_GOAL && (
        <div>
          <h2 className="text-xl font-bold">ゴールに到達しませんでした</h2>
        </div>
      )}
      <div>
        {`Deathのカードの所有者は${deathMember?.user?.displayName}です`}
      </div>
      <div>Emperorを選択してください</div>
      <Select value={emperorId} onValueChange={setEmperorId}>
        <SelectTrigger>
          <SelectValue placeholder="Emperorを選択してください" />
        </SelectTrigger>
        <SelectContent>
          {sessionInfo?.room.members.map((member) => (
            <SelectItem key={member.id} value={member.id.toString()}>
              {member.user?.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button disabled={!emperorId} onClick={checkResult}>
        結果確認
      </Button>
    </div>
  );
};
