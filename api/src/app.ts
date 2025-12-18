import express from "express";

import cors from "cors";
import routes from "./routes";
import "dotenv/config";
import { AppError } from "./error/AppError";
import pinoHttp from "pino-http";
import logger from "./util/logger";
import http from "http";
import { Server, Socket } from "socket.io";
import {
  ChatMessage,
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "./socket/socketTypes";
import { chatHandler } from "./socket/handlers/chatHandler";
import { authHandler } from "./socket/handlers/authHandler";
import { proofHandler } from "./socket/handlers/proofHandler";
import { orderHandler } from "./socket/handlers/orderHandler";
const app = express();

// app.use(
//   pinoHttp({
//     logger,
//     // 必要ならログ内容をカスタマイズ
//     customLogLevel: (req, res, err) => {
//       if (err || res.statusCode >= 500) return "error";
//       if (res.statusCode >= 400) return "warn";
//       return "info";
//     },
//   })
// );
app.use(cors());

const server = http.createServer(app);
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(server, {
  path: "/api/socket.io",
  cors: {
    origin: [
      "http://localhost:5173",
      "https://joelle-unreleasable-defeatedly.ngrok-free.dev",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.locals.io = io;

// 仮でメモリにチャット履歴を保持
const messages: ChatMessage[] = [
  { id: "1", user: "test", text: "Hello", createdAt: new Date().toISOString() },
];

io.on("connection", (socket) => {
  console.log("connected:", socket.id);

  // 初期メッセージ一覧を送信
  // socket.emit("chat:init", messages);
  authHandler(io, socket);
  chatHandler(io, socket);
  proofHandler(io, socket);
  orderHandler(io, socket);
  socket.on("disconnect", () => {
    console.log("disconnected:", socket.id);
  });
});

app.use(express.json());

app.use("/api", routes);

// 共通エラーハンドラ
app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    const status = err.statusCode || 500;
    res
      .status(status)
      .json({ message: err.message || "Internal Server Error" });
  }
);

const PORT = Number(process.env.PORT) || 3001;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`API server is running on port ${PORT}`);
});
