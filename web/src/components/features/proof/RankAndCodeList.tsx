import { PROOF_RANK } from "@/common/proofCommon";
import { Button } from "@/components/ui/button";
import { RankAndCode } from "./RankAndCode";
import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

interface RankAndCodeListProps {
  rankAndCodeList: RankAndCode[];
  onChange: Dispatch<SetStateAction<RankAndCode[]>>;
  isAddable?: boolean;
  maxLength?: number;
}
const addItem = (onChange: Dispatch<SetStateAction<RankAndCode[]>>) => {
  onChange((prev) => [...prev, { rank: PROOF_RANK.A, code: "" }]);
};
const removeItem = (
  index: number,
  onChange: Dispatch<SetStateAction<RankAndCode[]>>
) => {
  onChange((prev) => prev.filter((_, i) => i !== index));
};

export const RankAndCodeList = ({
  rankAndCodeList,
  onChange,
  isAddable,
  maxLength = 3,
}: RankAndCodeListProps) => {
  const handleRankChange = useCallback(
    (index: number) => (rank: keyof typeof PROOF_RANK) => {
      onChange((prev) =>
        prev.map((rankAndCode, i) =>
          i === index ? { ...rankAndCode, rank } : rankAndCode
        )
      );
    },
    [onChange]
  );

  const handleCodeChange = useCallback(
    (index: number) => (code: string) => {
      onChange((prev) =>
        prev.map((rankAndCode, i) =>
          i === index ? { ...rankAndCode, code } : rankAndCode
        )
      );
    },
    [onChange]
  );

  const handleRemove = useCallback(
    (index: number) => () => {
      removeItem(index, onChange);
    },
    [onChange]
  );

  const handleAdd = useCallback(() => {
    addItem(onChange);
  }, [onChange]);

  return (
    <div className="space-y-4">
      {rankAndCodeList.map((rankAndCode, index) => (
        <div
          key={index}
          className="flex flex-nowrap items-center gap-2 min-w-0"
        >
          <div className="flex-1 min-w-0">
            <RankAndCode
              rank={rankAndCode.rank}
              code={rankAndCode.code}
              rankChangeHandler={handleRankChange(index)}
              codeChangeHandler={handleCodeChange(index)}
            />
          </div>
          {isAddable && (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemove(index)}
            >
              削除
            </Button>
          )}
        </div>
      ))}
      {isAddable && rankAndCodeList.length < maxLength && (
        <Button
          type="button"
          variant="outline"
          onClick={handleAdd}
          className="w-full"
        >
          追加
        </Button>
      )}
    </div>
  );
};
