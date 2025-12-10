import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PROOF_RANK } from "@/common/proofCommon";
import { getProofStatus, revealProof } from "@/api/apiClient";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import type { DTOProofStatus } from "@/proofTypes";
import { useLoading } from "@/contexts/LoadingContext";
import { asyncWrapper } from "@/lib/errorHandler";
import { useNavigate } from "react-router-dom";
export const RevealRequest = () => {
  const [rank, setRank] = useState<keyof typeof PROOF_RANK>(PROOF_RANK.A);
  const [proofCode, setProofCode] = useState<string>("");
  const [proofStatus, setProofStatus] = useState<DTOProofStatus | null>(null);
  const { user } = useAuth();
  const { show, hide } = useLoading();
  const navigate = useNavigate();
  if (!user) return null;
  const getProofStatusHandler = async () => {
    show("証拠を検証中...");
    setProofStatus(null);
    const proofStatus = await getProofStatus(
      user.roomSessionId,
      rank + proofCode,
      user.memberId
    );
    hide();
    setProofStatus(proofStatus);
  };
  const revealProofHandler = async (isEntire: boolean) => {
    console.log("revealProofHandler", isEntire);
    show("証拠を公開中...");
    const revealedResult = await asyncWrapper(
      revealProof(user.roomSessionId, rank + proofCode, user.memberId, isEntire)
    );
    navigate("/public/proof/reveal/result", {
      state: { result: revealedResult },
    });
    hide();
  };
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <div className="flex items-center gap-4 p-4">
        <Select
          value={rank}
          onValueChange={(value) => setRank(value as keyof typeof PROOF_RANK)}
        >
          <SelectTrigger>
            <SelectValue placeholder="証拠コード" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={PROOF_RANK.A}>{PROOF_RANK.A}</SelectItem>
            <SelectItem value={PROOF_RANK.B}>{PROOF_RANK.B}</SelectItem>
            <SelectItem value={PROOF_RANK.C}>{PROOF_RANK.C}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          type="number"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="証拠コード"
          value={proofCode}
          onChange={(e) => {
            setProofCode(e.target.value);
            setProofStatus(null);
          }}
        />
      </div>

      {proofStatus ? (
        <>
          {!proofStatus.isExists && (
            <div className="flex p-4">証拠が存在しません</div>
          )}
          {proofStatus.isExists &&
            !proofStatus.ableToOpenToPrivate &&
            !proofStatus.ableToOpenToPublic && (
              <div className="flex p-4">証拠は全体に公開済みです</div>
            )}
          <RevealRequestButtonList
            proofStatus={proofStatus}
            revealProofHandler={revealProofHandler}
          />
        </>
      ) : (
        <div className="flex p-4">
          <Button
            className="w-full"
            onClick={getProofStatusHandler}
            disabled={!proofCode}
          >
            証拠を検証
          </Button>
        </div>
      )}
    </div>
  );
};

const RevealRequestButtonList = ({
  proofStatus,
  revealProofHandler,
}: {
  proofStatus: DTOProofStatus;
  revealProofHandler: (isEntire: boolean) => void;
}) => {
  return (
    <>
      <div className="flex p-2">
        {proofStatus.ableToOpenToPublic && (
          <Button className="w-full" onClick={() => revealProofHandler(true)}>
            証拠を全員に公開
          </Button>
        )}
      </div>
      <div className="flex p-2">
        {proofStatus.ableToOpenToPrivate && (
          <Button className="w-full" onClick={() => revealProofHandler(false)}>
            証拠を自分にだけ公開
          </Button>
        )}
      </div>
    </>
  );
};
