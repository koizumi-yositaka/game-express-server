import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CreatedRoom = () => {
  const location = useLocation();
  const { roomCode } = location.state || {};
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-6">
      <div className="text-6xl font-bold">{roomCode}</div>
      <Button onClick={() => navigate("/rooms")}>Back to rooms</Button>
    </div>
  );
};

export default CreatedRoom;
