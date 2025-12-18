import { useState } from "react";
import type { ProofSkillCommonProps } from "../ProofRole";
import { RankAndCode } from "../RankAndCode";
import { ProofSkillCommon } from "./ProofSkillCommon";
import { PROOF_RANK, PROOF_ROLE_NAME_MAP } from "@/common/proofCommon";
import { createUseSkillParam, useSkill } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { SkillUseResult } from "./SkillUseResult";
import type { UseSkillResult } from "@/proofTypes";
import { Card, CardContent } from "@/components/ui/card";

export const ProofSkillBomber = ({
  roomSession,
  me,
  skillDef,
}: ProofSkillCommonProps) => {
  const [rank, setRank] = useState<keyof typeof PROOF_RANK>(PROOF_RANK.A);
  const [code, setCode] = useState<string>("");
  const [isSkillUseResultDialogOpen, setIsSkillUseResultDialogOpen] =
    useState(false);
  const [skillUseResult, setSkillUseResult] = useState<UseSkillResult | null>(
    null
  );
  const useSkillHandler = async () => {
    const result = await useSkill(
      roomSession.id,
      me.id,
      createUseSkillParam(PROOF_ROLE_NAME_MAP.BOMBER, { rank, code })
    );
    setSkillUseResult(result);
  };
  return (
    <div className="space-y-6">
      <ProofSkillCommon roomSession={roomSession} me={me} skillDef={skillDef} />
      <Card>
        <CardContent className="pt-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">証拠コードを選択</h3>
            <RankAndCode
              rank={rank}
              code={code}
              rankChangeHandler={setRank}
              codeChangeHandler={setCode}
            />
          </div>
          <Button
            onClick={useSkillHandler}
            className="w-full"
            size="lg"
            disabled={!code}
          >
            スキルを使用
          </Button>
        </CardContent>
      </Card>
      {skillUseResult && (
        <SkillUseResult
          me={me}
          result={skillUseResult}
          isOpen={isSkillUseResultDialogOpen}
          onOpenChange={setIsSkillUseResultDialogOpen}
          title="スキル使用結果"
        />
      )}
    </div>
  );
};
