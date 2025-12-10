import { useCenterAuth } from "@/contexts/CenterAuthContext";
import { Navigate, useLocation } from "react-router-dom";

export const RequiredAuth = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useCenterAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // ログインしていなければ login へリダイレクト
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ログイン済みならそのまま表示
  return children;
};
