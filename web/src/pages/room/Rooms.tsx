import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  closeRoom,
  createRoom,
  getRooms,
  getRoomSessionByRoomId,
} from "@/api/apiClient";
import RoomCard from "@/components/features/room/RoomCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { DTORoom } from "@/types";

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
    const roomSession = await createRoom();
    console.log(roomSession);
    navigate(`/rooms/${roomSession.room.roomCode}/new`);
  };

  const handleDetail = async (room: DTORoom) => {
    if (room.status === 0) {
      navigate(`/rooms/${room.roomCode}/prepare`);
    } else {
      const roomSession = await getRoomSessionByRoomId(room.id);
      if (roomSession) {
        navigate(`/session/${roomSession.id}`);
      }
    }
  };

  const handleDelete = async (room: DTORoom) => {
    await closeRoom(room.roomCode);
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
            key={room.id}
            data={room}
            onDetailClick={() => handleDetail(room)}
            onDeleteClick={() => handleDelete(room)}
          />
        ))}
      </div>
    </div>
  );
};

export default Rooms;
