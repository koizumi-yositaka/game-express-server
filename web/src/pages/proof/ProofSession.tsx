import { useNavigate, useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

import {
  getProofRoleSetting,
  getProofSession,
  judgeAlreadyRevealed,
} from "@/api/apiClient";
import { ProofRole } from "@/components/features/proof/ProofRole";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  PROOF_MEMBER_STATUS,
  PROOF_ROOM_SESSION_STATUS,
} from "@/common/proofCommon";
import { ProofApplyCardCode } from "@/components/features/proof/ProofApplyCardCode";
import { getProofMessage } from "@/common/proofMessageConst";
import { callMyConfirm, showInfoDialog } from "@/util/myConfirm";
import { endOrder, startOrder } from "@/api/apiClient";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import { useAuthSocket } from "@/hooks/useSocket";
import { useState } from "react";
export const ProofSession = () => {
  const { roomSessionId } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useAuthSocket();
  const { user } = useAuth();
  const { isFocusing } = useOrderSocket({ setSessionRoom: () => {} });
  // useEffect(() => {
  //   const getSessionRoomInfo = async () => {
  //     const sessionRoomInfo = await getProofSession(Number(roomSessionId));
  //     console.log("sessionRoomInfo", sessionRoomInfo);
  //   };
  //   if (roomSessionId && user?.memberId) {
  //     getSessionRoomInfo();
  //   }
  // }, [roomSessionId, user?.memberId]);

  const {
    data: proofSession,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["proofSession", roomSessionId],
    queryFn: () => getProofSession(Number(roomSessionId)),
    enabled: !!roomSessionId,
    refetchInterval: 15000,
  });
  const { data: roleSetting } = useQuery({
    queryKey: ["roleSetting", roomSessionId, user?.memberId],
    queryFn: () =>
      getProofRoleSetting(Number(roomSessionId), user?.memberId ?? 0),
    enabled: !!roomSessionId && !!user?.memberId,
  });
  useEffect(() => {
    const judgeAlreadyRevealedHandler = async () => {
      if (!roomSessionId || !user?.memberId || !proofSession?.turn) {
        return;
      }
      const isAlreadyRevealed = await judgeAlreadyRevealed(
        Number(roomSessionId),
        proofSession?.turn,
        user?.memberId
      );

      setIsRevealed(isAlreadyRevealed);
    };
    judgeAlreadyRevealedHandler();
  }, [roomSessionId, user?.memberId, proofSession?.turn]);
  const { requestOrderAll } = useOrderSocket({
    setSessionRoom: () => {
      refetch();
    },
  });
  const [isRevealed, setIsRevealed] = useState(false);
  const isMyTurn = isFocusing || proofSession?.focusOn === user?.memberId;
  const me = proofSession?.room.members.find(
    (member) => member.id === user?.memberId
  );
  const isSkillUsed = me?.isSkillUsed;
  // もうあとはORderを完了させるだけの状態
  const isOrderToBeFinished = isSkillUsed || isRevealed;
  const isGameStarted =
    proofSession?.status &&
    proofSession.status >= PROOF_ROOM_SESSION_STATUS.TURN_STARTED;

  const isTurnStarted =
    isGameStarted &&
    proofSession?.status !== PROOF_ROOM_SESSION_STATUS.TURN_ENDED;

  // if (user && proofSession) {
  //   setUser({
  //     ...user,
  //     isFocusing: proofSession.focusOn === user.memberId,
  //   });
  // }

  const handleRevealRequest = () => {
    navigate(`/public/proof/${roomSessionId}/reveal/request`);
  };
  const handleProofList = () => {
    navigate(`/public/proof/${roomSessionId}/proofList`, {
      state: { memberId: user?.memberId },
    });
  };

  const handleNext = async () => {
    if (roomSessionId) {
      const currentUser = proofSession?.room.members.find(
        (member) => member.id === proofSession?.focusOn
      );
      const result = await callMyConfirm(
        getProofMessage("C1", currentUser?.user?.displayName ?? "")
      );
      if (!result) {
        return;
      }

      const { turnFinished, currentTurn } = await endOrder(
        Number(roomSessionId)
      );

      if (!turnFinished) {
        await startOrder(Number(roomSessionId));
      } else {
        const result = await showInfoDialog(getProofMessage("I1", currentTurn));
        if (!result) {
          return;
        }
        requestOrderAll(Number(roomSessionId));
      }
      refetch();
    }
  };

  const handleRequestReport = () => {
    navigate(`/public/proof/${roomSessionId}/report`, {
      state: { memberId: user?.memberId },
    });
  };

  const handleUseSkill = () => {
    navigate(`/public/proof/${roomSessionId}/skill`, {
      state: { memberId: user?.memberId, skillDef: roleSetting?.skillDef },
    });
  };
  if (!roomSessionId || !user?.memberId || isLoading || !isConnected) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error.message}</div>;
  }
  if (!proofSession) {
    return <div>Proof session not found</div>;
  }
  return (
    <div className="flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      {isFocusing && <div>Focusing...</div>}

      {me?.status && me.status < PROOF_MEMBER_STATUS.APPLY_CARD ? (
        <Card>
          <CardHeader>
            <CardTitle>手持ちのカードを登録してください</CardTitle>
          </CardHeader>
          <CardContent>
            <ProofApplyCardCode
              sessionId={Number(roomSessionId)}
              memberId={user?.memberId}
              refetch={refetch}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>役職情報</CardTitle>
            </CardHeader>
            <CardContent>
              <ProofRole
                role={me?.role ?? null}
                roleSetting={roleSetting ?? null}
              />
              {isMyTurn && (
                <Button
                  onClick={handleUseSkill}
                  disabled={
                    me?.isSkillUsed || isOrderToBeFinished || !isTurnStarted
                  }
                  className="w-full"
                >
                  {me?.isSkillUsed ? "使用済み" : "スキル使用"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                {isMyTurn ? (
                  <span>
                    あなたのターンです
                    {!isGameStarted && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        (ゲーム開始までお待ちください)
                      </span>
                    )}
                    {isGameStarted && !isTurnStarted && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        (ターン開始までお待ちください)
                      </span>
                    )}
                  </span>
                ) : (
                  "あなたのターンではありません"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {isMyTurn && !isRevealed && (
                  <Button
                    onClick={handleRevealRequest}
                    disabled={!isTurnStarted || isOrderToBeFinished}
                    className="w-full"
                  >
                    証拠公開依頼
                  </Button>
                )}
                <Button
                  onClick={handleProofList}
                  disabled={!isGameStarted}
                  className="w-full"
                >
                  証拠一覧
                </Button>
                <Button
                  onClick={handleRequestReport}
                  disabled={!isTurnStarted || !isMyTurn || isOrderToBeFinished}
                  className="w-full"
                >
                  告発
                </Button>
                <Button
                  onClick={handleNext}
                  disabled={!isTurnStarted || !isMyTurn}
                  className="w-full"
                >
                  ORDER完了
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
