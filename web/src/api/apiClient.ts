// 本番(Docker)では /api を、開発中はローカルの Express を叩くイメージ
const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:3001/api"; // このポートは後で Express 側に合わせて調整

export async function healthCheck() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) {
    throw new Error("Failed to health check");
  }
  return res.json();
}
