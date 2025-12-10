import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const SessionLayout = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/rooms");
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

export default SessionLayout;
