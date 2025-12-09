import { Server, Socket } from "socket.io";

export const authHandler = (io: Server, socket: Socket) => {
  socket.on("auth:login", (userId, roomSessionId) => {
    console.log("auth:login", userId);
    // todo
    socket.data.userId = userId;
    socket.data.roomSessionId = roomSessionId;
    socket.join(`user:${userId}`);
    socket.join(`room:${roomSessionId}`);
    io.to(`user:${userId}`).emit("auth:ok", userId);
  });

  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
};
