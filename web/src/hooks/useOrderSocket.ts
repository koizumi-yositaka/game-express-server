// client/src/hooks/useAuthSocket.ts
import { useCallback, useEffect } from "react";
import { socket } from "../lib/socket/socket";
import { useAuth } from "@/contexts/AuthContext";
import type { DTOProofRoomSession } from "@/proofTypes";
import type { SessonRoomInfo } from "@/lib/socket/socketTypes";
export const useOrderSocket = ({
  setSessionRoom,
}: {
  setSessionRoom?: (sessionRoom: DTOProofRoomSession | null) => void;
}) => {
  console.log("useChat");
  const { toggleIsFocusing } = useAuth();

  const requestOrderAll = useCallback((sessionRoomId: number) => {
    console.log("requestOrderAll", sessionRoomId);
    socket.emit("order:all", sessionRoomId);
  }, []);

  useEffect(() => {
    const handleOrderActivate = (message: string) => {
      console.log("handleOrderActivate", message);
      toggleIsFocusing(true);
    };
    const handleOrderDeactivate = (message: string) => {
      console.log("handleOrderDeactivate", message);
      toggleIsFocusing(false);
    };
    const handleOrderAll = (sessionRoomInfo: SessonRoomInfo) => {
      console.log("handleOrderAll", sessionRoomInfo);
      if (setSessionRoom) {
        setSessionRoom(sessionRoomInfo.sessionRoom);
      }
    };
    socket.on("order:activate", handleOrderActivate);
    socket.on("order:deactivate", handleOrderDeactivate);
    socket.on("order:all", handleOrderAll);
    return () => {
      socket.off("order:activate", handleOrderActivate);
      socket.off("order:deactivate", handleOrderDeactivate);
      socket.off("order:all", handleOrderAll);
    };
  }, []);
  return { requestOrderAll };
};
