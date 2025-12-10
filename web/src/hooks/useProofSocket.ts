// client/src/hooks/useAuthSocket.ts
import { useCallback, useEffect, useState } from "react";
import { socket } from "../lib/socket/socket";
import type { RevealResult } from "@/lib/socket/socketTypes";

export const useProofSocket = (revealResultReceivedAction?: () => void) => {
  const [revealResult, setRevealResult] = useState<RevealResult | null>(null);
  const initProof = useCallback((roomSessionId: number, memberId: number) => {
    socket.emit("proof:init", roomSessionId, memberId);
  }, []);

  useEffect(() => {
    const handleProofInit = (message: string) => {
      // const currentInfo = JSON.parse(message) as { me: ExtendedUserInfo };
      console.log("handleProofInit", message);
    };
    const handleProofRevealResult = (result: RevealResult) => {
      console.log("handleProofRevealResult", result);
      setRevealResult(result);
      if (revealResultReceivedAction) {
        revealResultReceivedAction();
      }
    };
    socket.on("proof:revealResult", handleProofRevealResult);
    socket.on("proof:init", handleProofInit);
    return () => {
      socket.off("proof:revealResult", handleProofRevealResult);
      socket.off("proof:init", handleProofInit);
    };
  }, []);

  return { initProof, revealResult };
};
