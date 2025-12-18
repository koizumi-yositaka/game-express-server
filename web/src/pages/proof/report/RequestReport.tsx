import { getProofSession, requestReport } from "@/api/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useCallback, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { RankAndCodeList } from "@/components/features/proof/RankAndCodeList";
import type { RankAndCode } from "@/components/features/proof/RankAndCode";
import { PROOF_RANK } from "@/common/proofCommon";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ProofReportResult } from "@/components/features/proof/report/ProofReportResult";
import type { RequestReportResult } from "@/proofTypes";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
const rankAndCodeListA1: RankAndCode[] = [{ rank: PROOF_RANK.A, code: "" }];
const rankAndCodeListB1: RankAndCode[] = [{ rank: PROOF_RANK.B, code: "" }];
const rankAndCodeListB2: RankAndCode[] = [
  { rank: PROOF_RANK.B, code: "" },
  { rank: PROOF_RANK.B, code: "" },
];
export const RequestReport = () => {
  const { roomSessionId } = useParams();
  const { memberId } = useLocation().state as { memberId: number };
  const { data: proofSession, isLoading } = useQuery({
    queryKey: ["proofSession", roomSessionId],
    queryFn: () => getProofSession(Number(roomSessionId)),
    enabled: !!roomSessionId,
  });
  const [proofsPattern, setProofsPattern] = useState<"A1" | "B1" | "B2">("A1");
  const [targetMemberId, setTargetMemberId] = useState<string>("");
  const [isRequestReportResultDialogOpen, setIsRequestReportResultDialogOpen] =
    useState(false);
  const [rankAndCodeList, setRankAndCodeList] =
    useState<RankAndCode[]>(rankAndCodeListA1);

  const [requestReportResult, setRequestReportResult] =
    useState<RequestReportResult | null>(null);
  const requestReportHandler = useCallback(async () => {
    if (
      !targetMemberId ||
      rankAndCodeList.length === 0 ||
      rankAndCodeList.some((rankAndCode) => rankAndCode.code === "")
    ) {
      return;
    }
    const requestReportBody = {
      targetMemberId: Number(targetMemberId),
      proofCodes: rankAndCodeList.map(
        (rankAndCode) => rankAndCode.rank + rankAndCode.code
      ),
    };
    const result = await requestReport(
      Number(roomSessionId),
      memberId,
      requestReportBody
    );
    setIsRequestReportResultDialogOpen(true);
    setRequestReportResult(result);
  }, [rankAndCodeList, targetMemberId, roomSessionId, memberId]);
  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">告発</h1>
        <p className="text-sm text-muted-foreground">告発者: {memberId}</p>
      </div>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">告発対象</label>
            <Select
              value={targetMemberId}
              onValueChange={(value) => {
                setTargetMemberId(value);
                console.log("targetMemberId", value);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="メンバーを選択" />
              </SelectTrigger>
              <SelectContent>
                {proofSession?.room.members
                  .filter((member) => member.id !== memberId)
                  .map((member) => (
                    <SelectItem key={member.id} value={member.id.toString()}>
                      {member.user?.displayName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">証拠</label>

            <RadioGroup
              className="flex flex-col gap-2"
              value={proofsPattern}
              onValueChange={(value) => {
                setProofsPattern(value as "A1" | "B1" | "B2");
                switch (value) {
                  case "A1":
                    setRankAndCodeList(rankAndCodeListA1);
                    break;
                  case "B1":
                    setRankAndCodeList(rankAndCodeListB1);
                    break;
                  case "B2":
                    setRankAndCodeList(rankAndCodeListB2);
                    break;
                }
              }}
            >
              <div className="flex items-center gap-3">
                <RadioGroupItem value="A1" id="r1" />
                <Label htmlFor="r1">Aの証拠が１つ</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="B2" id="r3" />
                <Label htmlFor="r3">Bの証拠が２つ</Label>
              </div>
              <div className="flex items-center gap-3">
                <RadioGroupItem value="B1" id="r2" />
                <Label htmlFor="r2">Bの証拠が１つ</Label>
              </div>
            </RadioGroup>

            <RankAndCodeList
              rankAndCodeList={rankAndCodeList}
              onChange={setRankAndCodeList}
            />
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full"
              disabled={
                !targetMemberId ||
                rankAndCodeList.length === 0 ||
                rankAndCodeList.some(
                  (rankAndCode) =>
                    rankAndCode.code === "" || rankAndCode.rank === undefined
                )
              }
              onClick={requestReportHandler}
            >
              告発
            </Button>
            {requestReportResult && (
              <RequestReportResultDialog
                isOpen={isRequestReportResultDialogOpen}
                onOpenChange={setIsRequestReportResultDialogOpen}
                title="告発結果"
              >
                <ProofReportResult result={requestReportResult} />
              </RequestReportResultDialog>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
const RequestReportResultDialog = ({
  isOpen,
  onOpenChange,
  title,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-none max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};
