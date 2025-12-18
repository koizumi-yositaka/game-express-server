import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  showErrorDialog,
  callMyConfirm,
  showInfoDialog,
} from "@/util/myConfirm";
import { getProofMessage } from "@/common/proofMessageConst";
import { applyCard, getProofStatus } from "@/api/apiClient";

export const ProofApplyCardCode = ({
  sessionId,
  memberId,
  refetch,
}: {
  sessionId: number;
  memberId: number;
  refetch: () => void;
}) => {
  const [code1, setCode1] = useState<string>("");
  const [code2, setCode2] = useState<string>("");
  const [code3, setCode3] = useState<string>("");
  const clickHandler = async () => {
    const codes = ["B" + code1, "B" + code2, "C" + code3];
    const result = await callMyConfirm(getProofMessage("C3", codes.join(",")));
    if (!result) {
      return;
    }
    const proofStatuses = await Promise.all(
      codes.map(async (code) => {
        return {
          code,
          status: await getProofStatus(sessionId, code, memberId),
        };
      })
    );
    const errorMessage = proofStatuses
      .filter((status) => !status.status.isExists)
      .map((status) => status.code)
      .join("\n");
    if (errorMessage) {
      await showErrorDialog(
        "存在しない証拠コードがあります ぼけ\n" + errorMessage
      );
      return;
    }
    const success = await applyCard(sessionId, codes, memberId);
    if (!success) {
      await showErrorDialog("証拠コードの登録に失敗しました");
    } else {
      const next = await showInfoDialog(getProofMessage("I3"));
      if (next) {
        refetch();
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-4">
        <ProofApplyCardCodeItem
          code={code1}
          setCode={setCode1}
          label="B"
          textId="code1"
        />
      </div>
      <div className="flex items-center gap-4">
        <ProofApplyCardCodeItem
          code={code2}
          setCode={setCode2}
          label="B"
          textId="code2"
        />
      </div>
      <div className="flex items-center gap-4">
        <ProofApplyCardCodeItem
          code={code3}
          setCode={setCode3}
          label="C"
          textId="code3"
        />
      </div>
      <Button
        disabled={code1 === "" || code2 === "" || code3 === ""}
        onClick={clickHandler}
      >
        証拠コード追加
      </Button>
    </div>
  );
};

const ProofApplyCardCodeItem = ({
  code,
  setCode,
  label,
  textId,
}: {
  code: string;
  setCode: (code: string) => void;
  label: string;
  textId: string;
}) => {
  return (
    <div className="flex items-center gap-4">
      <Label htmlFor={textId} className="w-6">
        {label}
      </Label>
      <Input
        id={textId}
        type="number"
        inputMode="numeric"
        pattern="[0-9]*"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};
