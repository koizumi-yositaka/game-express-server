import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCenterAuth } from "@/contexts/CenterAuthContext";
import { useState } from "react";

export const LoginPage = () => {
  const { login } = useCenterAuth();
  const [password, setPassword] = useState("");
  const handleLogin = async (type: "proof") => {
    await login(type, password);
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold">Login</h1>
      <div className="flex flex-col items-center justify-center gap-2">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button onClick={() => handleLogin("proof")}>Login Proof</Button>
      </div>
    </div>
  );
};
