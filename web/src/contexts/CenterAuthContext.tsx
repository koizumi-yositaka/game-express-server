// AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { centerLogin } from "@/api/apiClient";
type CenterAuthContextType = {
  isAuthenticated: boolean;
  type: "proof" | "center";
  login: (id: string, password: string) => Promise<void>;
  logout: () => void;
};

const CenterAuthContext = createContext<CenterAuthContextType | undefined>(
  undefined
);

export function CenterAuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [type] = useState<"proof" | "center">("center");
  const login = async (id: string, password: string) => {
    const response: any = await centerLogin(id, password);
    if (response.result === "ok") {
      setIsAuthenticated(true);
      navigate("/proof/rooms");
    } else {
      setIsAuthenticated(false);
      navigate("/login");
    }
  };
  const logout = () => setIsAuthenticated(false);

  return (
    <CenterAuthContext.Provider
      value={{ isAuthenticated, login, logout, type }}
    >
      {children}
    </CenterAuthContext.Provider>
  );
}

export function useCenterAuth() {
  const ctx = useContext(CenterAuthContext);
  if (!ctx)
    throw new Error("useCenterAuth must be used within CenterAuthProvider");
  return ctx;
}
