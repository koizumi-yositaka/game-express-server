import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export const RequiredAuth = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    // ログインしていなければ login へリダイレクト
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ログイン済みならそのまま表示
  return children;
};
