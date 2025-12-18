import type { ProofSkillCommonProps } from "../ProofRole";
import { ProofSkillCommon } from "./ProofSkillCommon";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { createUseSkillParam } from "@/api/apiClient";
import type { UseSkillResult } from "@/proofTypes";
import { PROOF_RANK, PROOF_ROLE_NAME_MAP } from "@/common/proofCommon";
import { RankAndCode } from "../RankAndCode";
import { Button } from "@/components/ui/button";
import { SkillUseResult } from "./SkillUseResult";
import { useSkill } from "@/api/apiClient";

export const ProofSkillSwitcher = ({
  roomSession,
  me,
  skillDef,
}: ProofSkillCommonProps) => {
  const [rank1, setRank1] = useState<keyof typeof PROOF_RANK>(PROOF_RANK.A);
  const [rank2, setRank2] = useState<keyof typeof PROOF_RANK>(PROOF_RANK.A);
  const [codeNumber1, setCodeNumber1] = useState<string>("");
  const [codeNumber2, setCodeNumber2] = useState<string>("");
  const [isSkillUseResultDialogOpen, setIsSkillUseResultDialogOpen] =
    useState(false);
  const [skillUseResult, setSkillUseResult] = useState<UseSkillResult | null>(
    null
  );
  const useSkillHandler = async () => {
    const result = await useSkill(
      roomSession.id,
      me.id,
      createUseSkillParam(PROOF_ROLE_NAME_MAP.SWITCHER, {
        rank1: rank1,
        rank2: rank2,
        code1: codeNumber1,
        code2: codeNumber2,
      })
    );
    setSkillUseResult(result);
    setIsSkillUseResultDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ProofSkillCommon roomSession={roomSession} me={me} skillDef={skillDef} />
      {!me.isSkillUsed && (
        <Card>
          <CardContent className="pt-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">証拠コードを選択</h3>
              <RankAndCode
                rank={rank1}
                code={codeNumber1}
                rankChangeHandler={setRank1}
                codeChangeHandler={setCodeNumber1}
              />
              <RankAndCode
                rank={rank2}
                code={codeNumber2}
                rankChangeHandler={setRank2}
                codeChangeHandler={setCodeNumber2}
              />
            </div>
            <Button
              onClick={useSkillHandler}
              className="w-full"
              size="lg"
              disabled={
                !codeNumber1 ||
                !codeNumber2 ||
                !rank1 ||
                !rank2 ||
                me.isSkillUsed
              }
            >
              スキルを使用
            </Button>
          </CardContent>
        </Card>
      )}
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
