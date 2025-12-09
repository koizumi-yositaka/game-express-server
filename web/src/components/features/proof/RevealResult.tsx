import { useLocation } from "react-router-dom";
import type { RevealResult as TRevealResult } from "@/proofTypes";
import { ShowProof } from "./ShowProof";
import { useNavigate } from "react-router-dom";
export const RevealResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result as TRevealResult;
  console.log("result", result);
  if (!result || !result.proof) {
    navigate("/public/proof/error", {
      state: {
        message: "proof not found",
      },
    });
  }
  return <div>{result.proof && <ShowProof proof={result.proof} />}</div>;
};
