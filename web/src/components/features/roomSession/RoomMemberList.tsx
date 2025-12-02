import type { DTOCommand, DTORoomSession } from "@/types";
import { useCallback } from "react";

export const RoomMemberList = ({
  roomSession,
}: {
  roomSession: DTORoomSession;
}) => {
  // まだ実行されていないコマンドのあるメンバーかどうかを判定
  const isCommandReceipt = useCallback(
    (commands: DTOCommand[], memberId: number) => {
      return commands.some(
        (command) => command.memberId === memberId && !command.processed
      );
    },
    []
  );
  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Members</h2>
      {roomSession.room.members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          まだ誰も参加していません
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {roomSession.room.members.map((member) => (
            <li
              key={member.id}
              className="flex items-center justify-between rounded border px-3 py-1"
            >
              <span className="font-mono">
                {member.user?.displayName || member.user?.userId}
              </span>
              {isCommandReceipt(roomSession.commands, member.id) ? (
                <span className="text-xs text-green-500">Command Received</span>
              ) : (
                <span className="text-xs text-red-500">
                  Command Not Received
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  );
};
