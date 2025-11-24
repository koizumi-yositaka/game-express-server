// 本番(Docker)では /api を、開発中はローカルの Express を叩くイメージ
const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:3001/api"; // このポートは後で Express 側に合わせて調整

export async function fetchUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) {
    throw new Error("Failed to fetch users");
  }
  return res.json();
}
