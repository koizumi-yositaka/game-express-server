// client/src/hooks/useAuthSocket.ts
import { useCallback, useEffect } from "react";
import { socket } from "../lib/socket/socket";

export const useProofSocket = () => {
  const initProof = useCallback((roomSessionId: number, memberId: number) => {
    console.log("initProof");
    console.log("initProof", roomSessionId, memberId);
    socket.emit("proof:init", roomSessionId, memberId);
  }, []);

  useEffect(() => {
    const handleProofInit = (message: string) => {
      // const currentInfo = JSON.parse(message) as { me: ExtendedUserInfo };
      console.log("handleProofInit", message);
    };
    socket.on("proof:init", handleProofInit);
    return () => {
      socket.off("proof:init", handleProofInit);
    };
  }, []);

  return { initProof };
};
