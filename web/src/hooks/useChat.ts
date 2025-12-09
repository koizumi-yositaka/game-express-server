// client/src/hooks/useAuthSocket.ts
import { useCallback, useEffect, useState } from "react";
import { socket } from "../lib/socket/socket";
import { useAuth } from "@/contexts/AuthContext";
import type { ChatMessage } from "@/lib/socket/socketTypes";
export const useChat = () => {
  console.log("useChat");
  const { user } = useAuth();
  console.log("user", user);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const sendMessage = useCallback(
    (text: string) => {
      console.log("sendMessage", text, user?.userId);
      if (!user?.userId || !text.trim()) return;
      console.log("sendMessage", { user: user.userId, text });
      socket.emit("chat:send", { user: user.userId, text });
    },
    [user?.userId]
  );

  useEffect(() => {
    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };
    const handleInit = (msgs: ChatMessage[]) => {
      setMessages(msgs);
      console.log("handleInit", msgs);
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:init", handleInit);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:init", handleInit);
    };
  }, []);

  return {
    messages,
    sendMessage,
  };
};
