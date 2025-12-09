// client/src/hooks/useAuthSocket.ts
import { useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../lib/socket/socket";

export const useAuthSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  const login = (userId: string, roomSessionId: string) => {
    socket.emit("auth:login", userId, roomSessionId);
  };

  useEffect(() => {
    connectSocket();

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleAuthOk = (message: string) => {
      console.log("handleAuthOk", message);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("auth:ok", handleAuthOk);
    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("auth:ok", handleAuthOk);
      disconnectSocket();
    };
  }, []);

  return {
    isConnected,
    login,
  };
};
