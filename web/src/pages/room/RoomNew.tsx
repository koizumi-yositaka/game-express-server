import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";

const RoomNew = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center gap-6">
      <div className="text-6xl font-bold">{roomCode}</div>
      <Button onClick={() => navigate(`/rooms/${roomCode}/prepare`)}>
        Back to rooms
      </Button>
    </div>
  );
};

export default RoomNew;
