import { Socket } from "socket.io";
import { ChatMessage } from "../socketTypes";
import { Server } from "socket.io";
export const chatHandler = (io: Server, socket: Socket) => {
  socket.on("chat:send", (msgPayload) => {
    const newMsg: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...msgPayload,
    };

    console.log("chat:send", newMsg);
    const returnMsg = {
      ...newMsg,
      text: `[${newMsg.user}] ${newMsg.text}`,
    };
    io.emit("chat:message", returnMsg);
  });
};
