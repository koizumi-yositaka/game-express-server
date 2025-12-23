import { useLocation } from "react-router-dom";
import type { RevealResult as TRevealResult } from "@/proofTypes";
import { ShowProof } from "./ShowProof";
import { useNavigate } from "react-router-dom";
import { REVEALED_RESULT_CODE } from "@/common/proofCommon";
export const RevealResult = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const result = state?.result as TRevealResult;
  console.log("result", result);
  if (!result || !result.proof) {
    navigate("/proof/error", {
      state: {
        message: "proof not found",
      },
    });
  }

  if (result.result === REVEALED_RESULT_CODE.BOMBED) {
    return <div>爆死です</div>;
  }
  if (result.result === REVEALED_RESULT_CODE.DISARM_SUCCESS) {
    return <div>爆弾を解除しました</div>;
  }
  if (result.result === REVEALED_RESULT_CODE.ALREADY_REVEALED) {
    return <div>このカードはすでに開示されています</div>;
  }
  if (result.result === REVEALED_RESULT_CODE.INVALID_CODE) {
    return <div>無効なコードです</div>;
  }
  if (result.result === REVEALED_RESULT_CODE.SUCCESS) {
    return <div>このカードは開示されました</div>;
  }
  return <div>{result.proof && <ShowProof proof={result.proof} />}</div>;
};
