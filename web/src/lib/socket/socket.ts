import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./socketTypes";

export const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
  import.meta.env.PROD ? "/" : "http://localhost:3001",
  {
    path: "/api/socket.io",
    autoConnect: false,
    reconnection: true,
  }
);

export const connectSocket = () => {
  if (!socket.connected) socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};
