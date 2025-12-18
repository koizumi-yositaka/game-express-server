import type { ProofSkillCommonProps } from "../ProofRole";
import { ProofSkillCommon } from "./ProofSkillCommon";
import { Card, CardContent } from "@/components/ui/card";

export const ProofSkillSquad = ({
  roomSession,
  me,
  skillDef,
}: ProofSkillCommonProps) => {
  return (
    <div className="space-y-6">
      <ProofSkillCommon roomSession={roomSession} me={me} skillDef={skillDef} />
      <Card>
        <CardContent className="pt-6 space-y-4">
          <p className="text-muted-foreground text-center py-4">
            このスキルは特別な設定が不要です
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
