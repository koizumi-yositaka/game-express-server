import { useLocation, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProofSession } from "@/api/apiClient";
import { PROOF_ROLE_NAME_MAP } from "@/common/proofCommon";
import { ProofSkillBomber } from "@/components/features/proof/roleSkill/ProofSkillBomber";
import type { RoleSkillDef } from "@/proofTypes";
import { ProofSkillSwitcher } from "@/components/features/proof/roleSkill/ProofSkillSwitcher";
import { ProofSkillStrength } from "@/components/features/proof/roleSkill/ProofSkillStrength";
import { ProofSkillSquad } from "@/components/features/proof/roleSkill/ProofSkillSquad";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const ProofUseSkill = () => {
  const { roomSessionId } = useParams();
  const location = useLocation();
  const { memberId, skillDef } = location.state as {
    memberId: number;
    skillDef: RoleSkillDef;
  };
  const { data: proofSession, isLoading } = useQuery({
    queryKey: ["proofSession", roomSessionId],
    queryFn: () => getProofSession(Number(roomSessionId)),
    enabled: !!roomSessionId,
  });
  const me = proofSession?.room.members.find(
    (member) => member.id === memberId
  );
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      </div>
    );
  }
  if (!me || !me.role || !skillDef) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              メンバーが見つかりません
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!proofSession) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-destructive text-center">
              ProofSessionが見つかりません
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {me.role.roleName}
              </Badge>
              <h1 className="text-2xl font-bold">スキルを使用</h1>
            </div>
            {me.role.roleName === PROOF_ROLE_NAME_MAP.BOMBER && (
              <ProofSkillBomber
                roomSession={proofSession}
                me={me}
                skillDef={skillDef}
              />
            )}
            {me.role.roleName === PROOF_ROLE_NAME_MAP.BOMB_SQUAD && (
              <ProofSkillSquad
                roomSession={proofSession}
                me={me}
                skillDef={skillDef}
              />
            )}
            {me.role.roleName === PROOF_ROLE_NAME_MAP.STRENGTH && (
              <ProofSkillStrength
                roomSession={proofSession}
                me={me}
                skillDef={skillDef}
              />
            )}
            {me.role.roleName === PROOF_ROLE_NAME_MAP.SWITCHER && (
              <ProofSkillSwitcher
                roomSession={proofSession}
                me={me}
                skillDef={skillDef}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
