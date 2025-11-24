import express from "express";

import cors from "cors";
import routes from "./routes";
import "dotenv/config";
const app = express();
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
