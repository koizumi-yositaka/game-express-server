// client/src/hooks/useAuthSocket.ts
import { useEffect } from "react";
import { socket } from "../lib/socket/socket";
import { useAuth } from "@/contexts/AuthContext";
export const useOrderSocket = () => {
  console.log("useChat");
  const { toggleIsFocusing } = useAuth();
  const dummy = "";

  useEffect(() => {
    const handleOrderActivate = (message: string) => {
      console.log("handleOrderActivate", message);
      toggleIsFocusing(true);
    };
    const handleOrderDeactivate = (message: string) => {
      console.log("handleOrderDeactivate", message);
      toggleIsFocusing(false);
    };
    socket.on("order:activate", handleOrderActivate);
    socket.on("order:deactivate", handleOrderDeactivate);

    return () => {
      socket.off("order:activate", handleOrderActivate);
      socket.off("order:deactivate", handleOrderDeactivate);
    };
  }, []);

  return { dummy };
};
