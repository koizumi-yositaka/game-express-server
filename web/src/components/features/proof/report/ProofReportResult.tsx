import type { RequestReportResult } from "@/proofTypes";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";
export const ProofReportResult = ({
  result,
}: {
  result: RequestReportResult;
}) => {
  return (
    <Card className={result.isSuccess ? "border-green-500" : "border-red-500"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {result.isSuccess ? (
            <CheckCircle2 className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
          スキル使用結果
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">結果:</span>
          <Badge variant={result.isSuccess ? "default" : "destructive"}>
            {result.isSuccess ? "成功" : "失敗"}
          </Badge>
        </div>
        {result.ngList.length > 0 && (
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              {result.ngList
                .map((ng) => ng.proofCode + ": " + ng.message)
                .join(", ")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
