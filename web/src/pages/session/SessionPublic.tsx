import { getRoomSession } from "@/api/apiClient";
import type { DTOCommandHistory, DTORoomMember } from "@/types";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { getCommandHistory } from "@/api/apiClient";
import { CommandHistoryMap } from "@/components/features/roomSession/CommandHistoryMap";

export const SessionPublic = () => {
  const [memberList, setMemberList] = useState<DTORoomMember[]>([]);
  const { roomSessionId } = useParams<{ roomSessionId: string }>();
  useEffect(() => {
    if (!roomSessionId) return;
    const fetchMemberList = async () => {
      const sessionInfo = await getRoomSession(Number(roomSessionId));
      setMemberList(sessionInfo.room.members);
    };
    fetchMemberList();
  }, [roomSessionId]);
  const {
    data: commandHistory,
    isLoading,
    error,
  } = useQuery<DTOCommandHistory[] | undefined>({
    queryKey: ["commandHistory", roomSessionId],
    queryFn: async () => {
      if (!roomSessionId) return undefined;
      return await getCommandHistory(Number(roomSessionId));
    },
    enabled: !!roomSessionId,
    refetchInterval: 10000,
  });
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  return (
    <CommandHistoryMap
      memberList={memberList}
      commandHistory={commandHistory ?? []}
    />
  );
};
