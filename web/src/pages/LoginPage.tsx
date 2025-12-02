import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export const LoginPage = () => {
  const { login } = useAuth();
  return (
    <div>
      <h1>Login</h1>
      <Button onClick={login}>Login</Button>
    </div>
  );
};
