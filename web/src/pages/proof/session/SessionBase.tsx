import { useParams } from "react-router-dom";
import { useProofSocket } from "@/hooks/useProofSocket";
import { useEffect, useState } from "react";
import {
  PROOF_ADMIN_USER_ID,
  PROOF_MEMBER_STATUS,
  PROOF_ROOM_SESSION_STATUS,
  REVEALED_RESULT_CODE,
} from "@/common/proofCommon";
import { useAuthSocket } from "@/hooks/useSocket";
import { useOrderSocket } from "@/hooks/useOrderSocket";
import type { DTOProofRoomSession } from "@/proofTypes";
import { ProofMemberList } from "@/components/features/proof/ProofMemberList";
import { Button } from "@/components/ui/button";
import { endOrder, startOrder, startProofTurn } from "@/api/apiClient";
import { callMyConfirm, showInfoDialog } from "@/util/myConfirm";
import { getProofMessage } from "@/common/proofMessageConst";
import { ShowProof } from "@/components/features/proof/ShowProof";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";

export const SessionBase = () => {
  const { roomSessionId } = useParams();
  const { login, isConnected } = useAuthSocket();
  const { revealResult } = useProofSocket(() => {
    setIsRevealResultDialogOpen(true);
  });
  const [isRevealResultDialogOpen, setIsRevealResultDialogOpen] =
    useState(true);
  const [sessionRoom, setSessionRoom] = useState<DTOProofRoomSession | null>(
    null
  );
  const { requestOrderAll } = useOrderSocket({ setSessionRoom });
  useEffect(() => {
    if (roomSessionId) {
      if (!isConnected) {
        login(PROOF_ADMIN_USER_ID, roomSessionId.toString());
      }
      requestOrderAll(Number(roomSessionId));
    }
  }, [roomSessionId, isConnected]);
  const handleNext = async () => {
    if (roomSessionId) {
      const currentUser = sessionRoom?.room.members.find(
        (member) => member.id === sessionRoom?.focusOn
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
    }
  };

  const startTurn = async () => {
    if (roomSessionId) {
      const result = await callMyConfirm(
        getProofMessage("C2", (sessionRoom?.turn ?? 0) + 1)
      );
      if (!result) {
        return;
      }
      await startProofTurn(Number(roomSessionId));
    }
    requestOrderAll(Number(roomSessionId));
  };
  const getTurnStatus = () => {
    if (sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.GAME_STARTED) {
      return "ゲーム開始";
    }
    if (sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.TURN_ENDED) {
      return "ターン開始待ち";
    }
    if (sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.ORDER_WAITING) {
      return "ORDER待ち";
    }
    if (sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.ORDER_COMPLETED) {
      return "ORDER完了";
    }
    return "不明";
  };
  const isAllReady = sessionRoom?.room.members.every(
    (member) => member.status >= PROOF_MEMBER_STATUS.APPLY_CARD
  );
  return (
    <div className="flex flex-col gap-4">
      {isAllReady ? (
        <div className="flex-1 ">
          今は {sessionRoom?.turn} ターン目です。 {getTurnStatus()}です。
        </div>
      ) : (
        <div className="text-red-500">
          全員が手持ちのカードを登録していません
        </div>
      )}

      <div className="flex-1 gap-2">
        {sessionRoom && (
          <ProofMemberList
            roomMenbers={sessionRoom.room.members}
            focusOn={sessionRoom.focusOn}
            isAllReady={!!isAllReady}
          />
        )}
      </div>
      <div className="flex gap-4">
        {(sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.GAME_STARTED ||
          sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.TURN_ENDED) && (
          <Button className="w-full" onClick={startTurn} disabled={!isAllReady}>
            ターン開始
          </Button>
        )}

        {sessionRoom?.status === PROOF_ROOM_SESSION_STATUS.ORDER_WAITING && (
          <Button className="w-full" onClick={handleNext}>
            ORDER完了
          </Button>
        )}
      </div>
      {revealResult && (
        <RevealResultDialog
          isOpen={isRevealResultDialogOpen}
          onOpenChange={setIsRevealResultDialogOpen}
          title={revealResult.message}
        >
          {revealResult.proof && <ShowProof proof={revealResult.proof} />}
          {revealResult.result === REVEALED_RESULT_CODE.BOMBED && (
            <div className="text-red-500">爆死です</div>
          )}
          {revealResult.result === REVEALED_RESULT_CODE.DISARM_SUCCESS && (
            <div className="text-green-500">爆弾を解除しました</div>
          )}
          {revealResult.result === REVEALED_RESULT_CODE.ALREADY_REVEALED && (
            <div className="text-yellow-500">
              このカードはすでに開示されています
            </div>
          )}
          {revealResult.result === REVEALED_RESULT_CODE.INVALID_CODE && (
            <div className="text-red-500">無効なコードです</div>
          )}
        </RevealResultDialog>
      )}
    </div>
  );
};

const RevealResultDialog = ({
  isOpen,
  onOpenChange,
  title,
  children,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}) => {
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-none max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    </>
  );
};
