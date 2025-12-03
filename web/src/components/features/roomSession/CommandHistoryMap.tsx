import type { DTOCommandHistory, DTORoomMember } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export const CommandHistoryMap = ({
  memberList,
  commandHistory,
}: {
  memberList: DTORoomMember[];
  commandHistory: DTOCommandHistory[];
}) => {
  // ターンごとにグループ化
  const turns = Array.from(new Set(commandHistory.map((cmd) => cmd.turn))).sort(
    (a, b) => b - a
  );

  // メンバーIDごとにコマンド履歴をマップ
  const commandMap = new Map<number, Map<number, DTOCommandHistory>>();
  commandHistory.forEach((cmd) => {
    if (!commandMap.has(cmd.memberId)) {
      commandMap.set(cmd.memberId, new Map());
    }
    commandMap.get(cmd.memberId)!.set(cmd.turn, cmd);
  });

  return (
    <div className="w-full">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">ターン</TableHead>
            {memberList.map((member) => (
              <TableHead key={member.id}>
                {member.user?.displayName || `メンバー${member.id}`}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {turns.map((turn) => (
            <TableRow key={turn}>
              <TableCell className="font-medium w-16">{turn}</TableCell>
              {memberList.map((member) => {
                const cmd = commandMap.get(member.id)?.get(turn);
                return (
                  <TableCell key={member.id}>
                    {cmd ? (
                      <span className="text-sm">
                        {cmd.command.commandType === "FORWARD"
                          ? "前進"
                          : cmd.command.commandType === "TURN_RIGHT"
                          ? "右回転"
                          : cmd.command.commandType === "TURN_LEFT"
                          ? "左回転"
                          : cmd.command.commandType}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
