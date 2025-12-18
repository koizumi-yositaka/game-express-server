import { PROOF_RANK } from "@/common/proofCommon";
import { memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
export type RankAndCode = {
  rank: keyof typeof PROOF_RANK;
  code: string;
};

export const RankAndCode = memo(
  ({
    rank,
    code,
    rankChangeHandler,
    codeChangeHandler,
  }: {
    rank: keyof typeof PROOF_RANK;
    code: string;
    rankChangeHandler: (rank: keyof typeof PROOF_RANK) => void;
    codeChangeHandler: (code: string) => void;
  }) => {
    return (
      <div className="flex flex-row flex-nowrap items-center gap-4 min-w-0">
        <div className="flex-1 min-w-0">
          <Select
            value={rank}
            onValueChange={(value) =>
              rankChangeHandler(value as keyof typeof PROOF_RANK)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="ランクを選択" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PROOF_RANK.A}>{PROOF_RANK.A}</SelectItem>
              <SelectItem value={PROOF_RANK.B}>{PROOF_RANK.B}</SelectItem>
              <SelectItem value={PROOF_RANK.C}>{PROOF_RANK.C}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-0">
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="証拠コードを入力"
            value={code}
            onChange={(e) => {
              codeChangeHandler(e.target.value);
            }}
            className="w-full"
          />
        </div>
      </div>
    );
  }
);
