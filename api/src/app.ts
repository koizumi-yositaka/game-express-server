import express from "express";

import cors from "cors";
import routes from "./routes";
import "dotenv/config";
import { AppError } from "./error/AppError";
import pinoHttp from "pino-http";
import logger from "./util/logger";
const app = express();

app.use(
  pinoHttp({
    logger,
    // 必要ならログ内容をカスタマイズ
    customLogLevel: (req, res, err) => {
      if (err || res.statusCode >= 500) return "error";
      if (res.statusCode >= 400) return "warn";
      return "info";
    },
  })
);
app.use(cors());
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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server is running on port ${PORT}`);
});
