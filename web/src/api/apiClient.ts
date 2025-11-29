import axiosInstance from "./axiousInstance";
import type { DTORoom, DTORoomSession, DTORoomMember } from "@/types";

export async function healthCheck() {
  try {
    const res = await axiosInstance.get(`/health`);
    return res.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getRooms(): Promise<DTORoom[]> {
  try {
    const res = await axiosInstance.get("/rooms");
    return res.data;
  } catch (error) {
    console.error("getRooms error:", error);
    throw error;
  }
}

export async function getRoomByRoomCode(roomCode: string): Promise<DTORoom> {
  try {
    const res = await axiosInstance.get(`/rooms/${roomCode}`);
    return res.data;
  } catch (error) {
    console.error("getRoomByRoomCode error:", error);
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
): Promise<DTORoomMember[]> {
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

export async function startGame(roomCode: string): Promise<DTORoomSession> {
  try {
    const res = await axiosInstance.post(`/rooms/${roomCode}/start`);
    return res.data;
  } catch (error) {
    console.error("startGame error:", error);
    throw error;
  }
}
export async function startTurn(
  roomSessionId: number
): Promise<DTORoomSession> {
  try {
    const res = await axiosInstance.post(
      `/sessions/${roomSessionId}/startTurn`
    );
    return res.data;
  } catch (error) {
    console.error("startTurn error:", error);
    throw error;
  }
}
export async function stepGameSession(
  roomSessionId: number
): Promise<DTORoomSession> {
  try {
    const res = await axiosInstance.post(`/sessions/${roomSessionId}/step`);
    return res.data;
  } catch (error) {
    console.error("stepGameSession error:", error);
    throw error;
  }
}

export async function getRoomSession(
  roomSessionId: number
): Promise<DTORoomSession> {
  try {
    const res = await axiosInstance.get(`/sessions/${roomSessionId}`);
    return res.data;
  } catch (error) {
    console.error("getRoomSession error:", error);
    throw error;
  }
}

export async function getRoomSessionByRoomId(
  roomId: number
): Promise<DTORoomSession> {
  try {
    const res = await axiosInstance.get(`/sessions?roomId=${roomId}`);
    return res.data;
  } catch (error) {
    console.error("getRoomSessionByRoomId error:", error);
    throw error;
  }
}
