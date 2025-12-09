import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { getProofSession } from "@/api/apiClient";
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
  return (
    <div className="flex flex-col gap-4 p-4">
      {user?.isFocusing ? <div>Focusing</div> : <div>Not Focusing</div>}
      <Button onClick={handleRevealRequest}>Reveal Request</Button>
    </div>
  );
};
