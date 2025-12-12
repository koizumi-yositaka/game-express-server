import { PROOF_RANK } from "@/common/proofCommon";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
export const RankAndCode = ({
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
    <div className="flex items-center gap-4 p-4">
      <Select
        value={rank}
        onValueChange={(value) =>
          rankChangeHandler(value as keyof typeof PROOF_RANK)
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="証拠コード" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PROOF_RANK.A}>{PROOF_RANK.A}</SelectItem>
          <SelectItem value={PROOF_RANK.B}>{PROOF_RANK.B}</SelectItem>
          <SelectItem value={PROOF_RANK.C}>{PROOF_RANK.C}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        placeholder="証拠コード"
        value={code}
        onChange={(e) => {
          codeChangeHandler(e.target.value);
        }}
      />
    </div>
  );
};
