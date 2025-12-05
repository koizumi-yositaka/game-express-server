import type { DTOCommand, DTORoomSession } from "@/types";
import { ROLE_GROUP_MAP } from "@/common";
export const ReceiptCommandList = ({
  roomSession,
  receiptCommandList,
}: {
  roomSession: DTORoomSession;
  receiptCommandList: DTOCommand[];
}) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-2">Receipt Command List</h2>
      {roomSession.room.members.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          まだ誰も参加していません
        </p>
      ) : (
        <ul className="space-y-1 text-sm">
          {roomSession.room.members
            .sort((a, b) => (a.role?.roleId ?? 0) - (b.role?.roleId ?? 0))
            .map((member) => (
              <li
                key={member.id}
                className="flex items-center justify-between rounded border px-3 py-1"
              >
                <span className="font-mono">{member.role?.roleName}</span>
                <span className="text-xs text-red-500">
                  {member.role?.group === ROLE_GROUP_MAP.KINGDOM
                    ? receiptCommandList.find(
                        (command) => command.memberId === member.id
                      )?.commandType
                    : ""}
                </span>
              </li>
            ))}
        </ul>
      )}
    </>
  );
};
