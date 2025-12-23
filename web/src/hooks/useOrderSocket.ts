// client/src/hooks/useAuthSocket.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { socket } from "../lib/socket/socket";

import type { DTOProofRoomSession } from "@/proofTypes";
import type { SessonRoomInfo } from "@/lib/socket/socketTypes";
export const useOrderSocket = ({
  setSessionRoom,
  callTurnFinished,
}: {
  setSessionRoom?: (sessionRoom: DTOProofRoomSession | null) => void;
  callTurnFinished?: () => Promise<void>;
}) => {
  const [isFocusing, setIsFocusing] = useState(false);
  const setSessionRoomRef = useRef(setSessionRoom);
  const callTurnFinishedRef = useRef(callTurnFinished);
  // setSessionRoomの最新の参照を保持
  useEffect(() => {
    setSessionRoomRef.current = setSessionRoom;
  }, [setSessionRoom]);
  useEffect(() => {
    callTurnFinishedRef.current = callTurnFinished;
  }, [callTurnFinished]);
  const requestOrderAll = useCallback((sessionRoomId: number) => {
    console.log("requestOrderAll", sessionRoomId);
    socket.emit("order:all", sessionRoomId);
  }, []);

  useEffect(() => {
    const handleOrderActivate = (message: string) => {
      console.log("handleOrderActivate", message);
      if (setSessionRoomRef.current) {
        setSessionRoomRef.current(null);
      }
      setIsFocusing(true);
    };
    const handleOrderDeactivate = (message: string) => {
      console.log("handleOrderDeactivate", message);
      if (setSessionRoomRef.current) {
        setSessionRoomRef.current(null);
      }
      setIsFocusing(false);
    };
    const handleOrderAll = (sessionRoomInfo: SessonRoomInfo) => {
      console.log("handleOrderAll", sessionRoomInfo);
      if (setSessionRoomRef.current) {
        setSessionRoomRef.current(sessionRoomInfo.sessionRoom);
      }
    };
    const handleOrderFinished = () => {
      console.log("handleOrderFinished");
      if (callTurnFinishedRef.current) {
        callTurnFinishedRef.current();
      }
    };
    socket.on("order:activate", handleOrderActivate);
    socket.on("order:deactivate", handleOrderDeactivate);
    socket.on("order:all", handleOrderAll);
    socket.on("order:finished", handleOrderFinished);
    return () => {
      socket.off("order:activate", handleOrderActivate);
      socket.off("order:deactivate", handleOrderDeactivate);
      socket.off("order:all", handleOrderAll);
      socket.off("order:finished", handleOrderFinished);
    };
  }, []);
  return { requestOrderAll, isFocusing };
};
