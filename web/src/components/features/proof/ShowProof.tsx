import type { DTOProof } from "@/proofTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PROOF_STATUS, PROOF_STATUS_MAP } from "@/common/proofCommon";
import { cn } from "@/lib/utils";

export const ShowProof = ({
  proof,
  isBomShow,
}: {
  proof: DTOProof;
  isBomShow?: boolean;
}) => {
  const getStatusInfo = () => {
    switch (proof.status) {
      case PROOF_STATUS.NORMAL:
        return {
          label: PROOF_STATUS_MAP.NORMAL,
          variant: "outline" as const,
          className:
            "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300",
        };
      case PROOF_STATUS.DUMMY:
        return {
          label: PROOF_STATUS_MAP.DUMMY,
          variant: "outline" as const,
          className:
            "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300",
        };
      case PROOF_STATUS.BOMBED:
        return {
          label: PROOF_STATUS_MAP.BOMBED,
          variant: "destructive" as const,
          className:
            "bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300",
        };
      case PROOF_STATUS.REVEALED_TO_ONE:
        return {
          label: PROOF_STATUS_MAP.REVEALED_TO_ONE,
          variant: "secondary" as const,
          className:
            "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300",
        };
      case PROOF_STATUS.REVEALED_TO_ALL:
        return {
          label: PROOF_STATUS_MAP.REVEALED_TO_ALL,
          variant: "default" as const,
          className:
            "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300",
        };
      default:
        return {
          label: "不明",
          variant: "outline" as const,
          className:
            "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-950 dark:border-gray-800 dark:text-gray-300",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant={statusInfo.variant}
              className={cn("text-xs", statusInfo.className)}
            >
              {statusInfo.label}
            </Badge>
            {isBomShow && proof.bomFlg && (
              <Badge
                variant="outline"
                className="text-xs bg-red-50 border-red-200 text-red-700 dark:bg-red-950 dark:border-red-800 dark:text-red-300"
              >
                爆弾
              </Badge>
            )}
          </div>
          <CardTitle className="text-l">
            {proof.code} {proof.title}
          </CardTitle>
        </div>
      </CardHeader>
      {proof.description && (
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {proof.description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};
