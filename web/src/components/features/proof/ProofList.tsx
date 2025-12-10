import { getProofList } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
import { ShowProof } from "@/components/features/proof/ShowProof";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PROOF_RANK } from "@/common/proofCommon";
import type { DTOProof } from "@/proofTypes";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

export const ProofList = ({}) => {
  const { roomSessionId } = useParams();
  const { state } = useLocation();
  const [isFilter, setIsFilter] = useState(true);
  const memberId = state?.memberId;
  const {
    data: proofs,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["proofs", roomSessionId, memberId],
    queryFn: () => getProofList(Number(roomSessionId), Number(memberId)),
    enabled: !!roomSessionId && !!memberId,
    refetchInterval: 30000,
  });

  const proofsByRank = useMemo(() => {
    if (!proofs) return {};
    const grouped: Record<string, DTOProof[]> = {};
    proofs
      .filter((proof) => {
        if (isFilter) {
          return proof.status !== "???";
        }
        return true;
      })
      .forEach((proof) => {
        const rank = proof.rank || "その他";
        if (!grouped[rank]) {
          grouped[rank] = [];
        }
        grouped[rank].push(proof);
      });
    return grouped;
  }, [proofs, isFilter]);

  const rankOrder = [PROOF_RANK.A, PROOF_RANK.B, PROOF_RANK.C, "その他"];

  return (
    <div className="flex flex-col gap-4">
      {proofs && (
        <div className="flex justify-between items-center gap-3 px-1">
          <div className="flex items-center gap-2">
            <Switch
              id="filter-switch"
              checked={isFilter}
              onCheckedChange={setIsFilter}
            />
            <Label
              htmlFor="filter-switch"
              className="text-sm font-medium cursor-pointer"
            >
              開封済みのみ表示
            </Label>
          </div>
          <div>
            <Button variant="outline" onClick={() => refetch()}>
              更新
            </Button>
          </div>
        </div>
      )}
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {proofs && (
        <Accordion type="multiple" className="w-full">
          {rankOrder.map((rank) => {
            const rankProofs = proofsByRank[rank];
            if (!rankProofs || rankProofs.length === 0) return null;
            return (
              <AccordionItem key={rank} value={rank}>
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Rank {rank}</span>
                    <span className="text-sm text-muted-foreground">
                      ({rankProofs.length}件)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="flex flex-col gap-4">
                    {rankProofs
                      .sort(
                        (a, b) =>
                          parseInt(a.code.slice(1)) - parseInt(b.code.slice(1))
                      )
                      .map((proof) => (
                        <ShowProof key={proof.id} proof={proof} />
                      ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};
