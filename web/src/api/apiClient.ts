import axiosInstance from "./axiousInstance";
import type { DTORoom, DTORoomMembers } from "@/types";

export async function healthCheck() {
  try {
    const res = await axiosInstance.get(`/health`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getRooms(): Promise<DTORoomMembers[]> {
  try {
    const res = await axiosInstance.get("/rooms");
    return res.data;
  } catch (error) {
    console.error("getRooms error:", error);
    throw error;
  }
}

export async function createRoom(): Promise<DTORoom> {
  try {
    const res = await axiosInstance.post("/rooms", { roomCode: "1234" });
    return res.data;
  } catch (error) {
    console.error("createRoom error:", error);
    throw error;
  }
}

export async function getRoomMembers(
  roomCode: string
): Promise<DTORoomMembers> {
  try {
    const res = await axiosInstance.get(`/rooms/${roomCode}/members`);
    return res.data;
  } catch (error) {
    console.error("getRoomMembers error:", error);
    throw error;
  }
}

export async function closeRoom(roomCode: string): Promise<void> {
  try {
    await axiosInstance.post(`/rooms/${roomCode}/close`);
  } catch (error) {
    console.error("deleteRoom error:", error);
    throw error;
  }
}
