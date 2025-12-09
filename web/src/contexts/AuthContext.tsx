// AuthContext.tsx
import { createContext, useContext, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { PROOF_MEMBER_STATUS } from "@/common/proofCommon";
import { type ExtendedUserInfo } from "@/lib/socket/socketTypes";

type AuthContextType = {
  user: ExtendedUserInfo | null;
  setUser: (user: ExtendedUserInfo) => void;
  login: () => void;
  logout: () => void;
  toggleIsFocusing: (isFocusing: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [user, setExtendedUser] = useState<ExtendedUserInfo | null>(null);

  const login = () => {
    setExtendedUser({
      userId: "1",
      roomSessionId: 1,
      roomCode: "1234",
      displayName: "test",
      memberId: 1,
      roleName: "DETECTIVE",
      status: PROOF_MEMBER_STATUS.ENTERED,
      isFocusing: false,
    }); // 本当はAPI叩いたりする
    navigate("/rooms");
  };
  const logout = () => setExtendedUser(null);
  const setUser = (user: ExtendedUserInfo) => {
    console.log("setUser", user);
    setExtendedUser(user);
  };
  const toggleIsFocusing = (isFocusing: boolean) => {
    setExtendedUser((prev) => ({
      ...prev!,
      isFocusing,
    }));
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, login, logout, toggleIsFocusing }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
