import { Button } from "@/components/ui/button";

import { useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { decodeToken } from "@/api/apiClient";
import { useAuthSocket } from "@/hooks/useSocket";
import { useOrderSocket } from "@/hooks/useOrderSocket";

export const ProofLayout = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const { login } = useAuthSocket();
  const { dummy } = useOrderSocket();
  const { roomSessionId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  console.log("dummy", dummy);
  let currentSessionRoomID =
    roomSessionId ?? localStorage.getItem("currentSessionRoomID");
  let currentSessionToken =
    token ?? localStorage.getItem("currentSessionToken");
  useEffect(() => {
    if (currentSessionRoomID && currentSessionToken) {
      const fetchUser = async () => {
        const user = await decodeToken(currentSessionToken);
        setUser({ ...user, isFocusing: false });
        login(user.userId, currentSessionRoomID);
      };
      if (!user) {
        fetchUser();
      }
      localStorage.setItem("currentSessionRoomID", currentSessionRoomID);
      localStorage.setItem("currentSessionToken", currentSessionToken);
    } else {
      navigate("/public/proof/error", {
        state: {
          message: "currentSessionRoomID or currentSessionToken not found",
        },
      });
    }

    return () => {};
  }, []);

  const handleBack = () => {
    if (currentSessionRoomID && currentSessionToken) {
      navigate(
        `/public/proof/${currentSessionRoomID}?token=${currentSessionToken}`
      );
    } else {
      navigate("/public/proof/error", {
        state: {
          message: "currentSessionRoomID or currentSessionToken not found",
        },
      });
    }
  };
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <Button onClick={handleBack} variant="outline">
          Proof Back
        </Button>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};
