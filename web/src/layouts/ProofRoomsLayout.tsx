import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProofRoomsLayout = () => {
  const navigate = useNavigate();
  const handleBack = () => {
    navigate("/proof/rooms");
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

export default ProofRoomsLayout;
