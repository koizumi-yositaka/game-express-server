import type { DTOProofRoomMember } from "@/proofTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { PROOF_MEMBER_STATUS } from "@/common/proofCommon";

export const ProofMemberList = ({
  roomMenbers,
  focusOn,
  isAllReady,
}: {
  roomMenbers: DTOProofRoomMember[];
  focusOn: number;
  isAllReady: boolean;
}) => {
  const getDesignByStatus = (status: number) => {
    const design = {
      className: "",
      content: "",
    };
    switch (status) {
      case PROOF_MEMBER_STATUS.ENTERED:
        design.className =
          "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300";
        design.content = "入室済み";

        break;
      case PROOF_MEMBER_STATUS.ASSIGNED:
        design.className =
          "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300";
        design.content = "手持ちのカードを登録してください";
        break;
      case PROOF_MEMBER_STATUS.APPLY_CARD:
        design.className =
          "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300";
        design.content = "";
        break;
      case PROOF_MEMBER_STATUS.BOMBED:
        design.className =
          "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300";
        design.content = "爆死";
        break;
      default:
        design.className =
          "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300";
        design.content = "不明";
        break;
    }
    return design;
  };
  return (
    <div className="space-y-4">
      {focusOn &&
        (isAllReady ? (
          <div className="text-sm text-muted-foreground">
            現在:{" "}
            {
              roomMenbers.find((member) => member.id === focusOn)?.user
                ?.displayName
            }{" "}
            の番です
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            全員が手持ちのカードを登録していません
          </div>
        ))}
      <div className="grid grid-cols-3 gap-4">
        {roomMenbers
          .sort((a, b) => a.sort - b.sort)
          .map((member) => (
            <Card
              key={member.id}
              className={cn(
                "transition-all",
                focusOn === member.id && "bg-primary/10 border-primary border-2"
              )}
            >
              <CardHeader>
                <CardTitle className="text-base">
                  {member.sort + 1}. {member.user?.displayName || "Unknown"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {getDesignByStatus(member.status).content}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
};
