import type { ProofSkillCommonProps } from "../ProofRole";
import { Badge } from "@/components/ui/badge";

export const ProofSkillCommon = ({ me, skillDef }: ProofSkillCommonProps) => {
  const remainingUses =
    skillDef.skillLimit === 0
      ? "無制限"
      : skillDef.skillLimit - me.skillUsedTime;

  return (
    <div className="space-y-4 mb-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold">{skillDef.skillName}</h2>
          <Badge variant="outline" className="ml-auto">
            残り: {remainingUses}回
          </Badge>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          {skillDef.skillDescription}
        </p>
      </div>
      <div className="border-t border-border" />
    </div>
  );
};
