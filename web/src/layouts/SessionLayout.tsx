import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SessionLayout = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/rooms");
  };
  return (
    <div>
      <Button onClick={handleBack} variant="outline">
        Session Back
      </Button>
      <Outlet />
    </div>
  );
};

export default SessionLayout;
