import express, { Request, Response } from "express";

import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// ヘルスチェック用
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok" });
});

const PORT = Number(process.env.PORT) || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`API server is running on port ${PORT}`);
});
