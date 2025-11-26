import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RoomsLayout = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/rooms");
  };
  return (
    <div>
      <Button onClick={handleBack} variant="outline">
        Back
      </Button>
      <Outlet />
    </div>
  );
};

export default RoomsLayout;
