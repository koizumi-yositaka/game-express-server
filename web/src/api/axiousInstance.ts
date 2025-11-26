import axios from "axios";

const END_POINT = import.meta.env.PROD ? "/api" : "http://localhost:3001/api";

const axiosInstance = axios.create({
  baseURL: END_POINT, // 共通のAPIエンドポイント
  timeout: 10000, // タイムアウト時間 (ミリ秒)
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエスト時の共通処理
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("[Request Error]", error);
    return Promise.reject(error);
  }
);

// レスポンス時の共通処理
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(
      "[Response Error]",
      error.response ? error.response.data : error
    );
    return Promise.reject(error);
  }
);

export default axiosInstance;
