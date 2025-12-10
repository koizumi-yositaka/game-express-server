import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createProofRoom,
  getProofRooms,
  closeProofRoom,
  getProofSessionByRoomId,
} from "@/api/apiClient";
import RoomCard from "@/components/features/room/RoomCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { callMyConfirm } from "@/util/myConfirm";
import { useLoading } from "@/contexts/LoadingContext";
import type { DTOProofRoom } from "@/proofTypes";

const ProofRooms = () => {
  const {
    data: rooms,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rooms"],
    queryFn: getProofRooms,
    refetchInterval: 3000,
  });
  const { show, hide } = useLoading();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const handleCreateRoom = async () => {
    try {
      show("Creating room...");
      const room = await createProofRoom();
      navigate(`/proof/rooms/${room.roomCode}/new`);
    } catch (error) {
      console.error("createRoom error:", error);
    } finally {
      hide();
    }
  };

  const handleDetail = async (room: DTOProofRoom) => {
    if (room.status === 0) {
      navigate(`/proof/rooms/${room.roomCode}/prepare`);
    } else {
      const roomSession = await getProofSessionByRoomId(room.id);
      if (roomSession) {
        navigate(`/proof/session/${roomSession.id}`);
      }
    }
  };

  const handleDelete = async (room: DTOProofRoom) => {
    const result = await callMyConfirm(
      "Are you sure you want to delete this room?"
    );
    if (!result) {
      return;
    }
    await closeProofRoom(room.roomCode);
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

export default ProofRooms;
