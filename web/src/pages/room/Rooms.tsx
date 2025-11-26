import { useQuery, useQueryClient } from "@tanstack/react-query";
import { closeRoom, createRoom, getRooms } from "@/api/apiClient";
import RoomCard from "@/components/features/room/RoomCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Rooms = () => {
  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
    refetchInterval: 3000,
  });

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleCreateRoom = async () => {
    const room = await createRoom();
    console.log(room);
    navigate("/rooms/new", { state: { roomCode: room.roomCode } });
  };

  const handleDetail = (roomCode: string) => {
    navigate(`/rooms/${roomCode}`);
  };

  const handleDelete = async (roomCode: string) => {
    await closeRoom(roomCode);
    queryClient.invalidateQueries({ queryKey: ["rooms"] });
  };
  if (isLoading) return <div>Loading...</div>;

  if (error instanceof Error) {
    return <div className="text-red-500">Error: {error.message}</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-4">
        <Button onClick={handleCreateRoom}>Create Room</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rooms?.map((room) => (
          <RoomCard
            key={room.room.id}
            data={room}
            onDetailClick={() => handleDetail(room.room.roomCode)}
            onDeleteClick={() => handleDelete(room.room.roomCode)}
          />
        ))}
      </div>
    </div>
  );
};

export default Rooms;
