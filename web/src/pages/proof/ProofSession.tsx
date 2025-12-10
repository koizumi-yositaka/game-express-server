import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { getProofSession } from "@/api/apiClient";
import type { PROOF_ROLE_NAME_MAP } from "@/proofTypes";
import { ProofRole } from "@/components/features/proof/ProofRole";
export const ProofSession = () => {
  const { roomSessionId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  useEffect(() => {
    const getSessionRoomInfo = async () => {
      const sessionRoomInfo = await getProofSession(Number(roomSessionId));
      console.log("sessionRoomInfo", sessionRoomInfo);
      if (user) {
        setUser({
          ...user,
          isFocusing: sessionRoomInfo.focusOn === user.memberId,
        });
      }
    };
    if (roomSessionId && user?.memberId) {
      getSessionRoomInfo();
    }
  }, [roomSessionId, user?.memberId]);
  const handleRevealRequest = () => {
    navigate(`/public/proof/${roomSessionId}/reveal/request`);
  };
  const handleProofList = () => {
    navigate(`/public/proof/${roomSessionId}/proofList`, {
      state: { memberId: user?.memberId },
    });
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <ProofRole
        roleName={user?.roleName as keyof typeof PROOF_ROLE_NAME_MAP}
      />
      {user?.isFocusing ? (
        <>
          <div>あなたのターンです</div>
          <Button onClick={handleRevealRequest}>証拠公開依頼</Button>
        </>
      ) : (
        <div>あなたのターンではありません</div>
      )}

      <Button onClick={handleProofList}>証拠一覧</Button>
    </div>
  );
};
