import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { decodeToken } from "@/api/apiClient";

const Root = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  console.log("######params##", searchParams);
  const token = searchParams.get("token");

  useEffect(() => {
    const navigateToPlayerPage = async (token: string) => {
      if (!token) return;
      try {
        const user = await decodeToken(token);
        navigate(`/public/proof/${user.roomSessionId}?token=${token}`);
      } catch (error) {
        console.error("decodeToken error:", error);
        navigate("/login");
      }
    };
    if (token) {
      navigateToPlayerPage(token);
    } else {
      console.log("######no token tologin##");
      navigate("/login");
    }
  }, [token]);

  return null;
};

export default Root;
