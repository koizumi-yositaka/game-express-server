import axiosInstance from "./axiousInstance";
import type {
  DTORoom,
  DTORoomSession,
  DTORoomMember,
  DTOCommandHistory,
} from "@/types";
import type {
  DTOProofRoom,
  DTOProofRoomMember,
  DTOProofRoomSession,
  DTOProofStatus,
  DecodedUserInfo,
  RevealResult,
  DTOProof,
  RoleFeatureB,
  RoleSkillDef,
  UseSkillResult,
  RequestReportResult,
} from "@/proofTypes";
import { PROOF_ROLE_NAME_MAP } from "@/common/proofCommon";
import { z } from "zod";

export async function centerLogin(id: string, password: string): Promise<void> {
  try {
    const res = await axiosInstance.post("/users/login", { id, password });
    return res.data;
  } catch (error) {
    console.error("login error:", error);
    throw error;
  }
}
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

export async function getCommandHistory(
  roomSessionId: number
): Promise<DTOCommandHistory[]> {
  try {
    const res = await axiosInstance.get(
      `/sessions/${roomSessionId}/commandHistory`
    );
    return res.data;
  } catch (error) {
    console.error("getCommandHistory error:", error);
    throw error;
  }
}
export async function gameComplete(
  roomSessionId: number,
  result: number
): Promise<void> {
  try {
    await axiosInstance.post(`/sessions/${roomSessionId}/complete`, { result });
  } catch (error) {
    console.error("gameComplete error:", error);
    throw error;
  }
}
// proof

export async function getProofList(
  roomSessionId: number,
  memberId?: number
): Promise<DTOProof[]> {
  try {
    const res = await axiosInstance.get(
      memberId
        ? `/proofs/sessions/${roomSessionId}/proofList?memberId=${memberId}`
        : `/proofs/sessions/${roomSessionId}/proofList`
    );
    return res.data;
  } catch (error) {
    console.error("getProofList error:", error);
    throw error;
  }
}

export async function getProofRooms(): Promise<DTOProofRoom[]> {
  try {
    const res = await axiosInstance.get("/proofs/rooms");
    return res.data;
  } catch (error) {
    console.error("getRooms error:", error);
    throw error;
  }
}

export async function getProofRoomByRoomCode(
  roomCode: string
): Promise<DTOProofRoom> {
  try {
    const res = await axiosInstance.get(`/proofs/rooms/${roomCode}`);
    return res.data;
  } catch (error) {
    console.error("getRoomByRoomCode error:", error);
    throw error;
  }
}
export async function createProofRoom(): Promise<DTOProofRoom> {
  try {
    const res = await axiosInstance.post("/proofs/rooms");
    return res.data;
  } catch (error) {
    console.error("createRoom error:", error);
    throw error;
  }
}

export async function getProofRoomMembers(
  roomCode: string
): Promise<DTOProofRoomMember[]> {
  try {
    const res = await axiosInstance.get(`/proofs/rooms/${roomCode}/members`);
    return res.data;
  } catch (error) {
    console.error("getRoomMembers error:", error);
    throw error;
  }
}

export async function closeProofRoom(roomCode: string): Promise<void> {
  try {
    await axiosInstance.post(`/proofs/rooms/${roomCode}/close`);
  } catch (error) {
    console.error("deleteRoom error:", error);
    throw error;
  }
}

export async function startProofGame(
  roomCode: string
): Promise<DTOProofRoomSession> {
  try {
    const res = await axiosInstance.post(`/proofs/rooms/${roomCode}/start`);
    return res.data;
  } catch (error) {
    console.error("startGame error:", error);
    throw error;
  }
}

export async function getProofSession(
  roomSessionId: number
): Promise<DTOProofRoomSession> {
  try {
    const res = await axiosInstance.get(`/proofs/sessions/${roomSessionId}`);
    return res.data;
  } catch (error) {
    console.error("getProofSession error:", error);
    throw error;
  }
}

export async function getProofSessionByRoomId(
  roomId: number
): Promise<DTOProofRoomSession> {
  try {
    const res = await axiosInstance.get(`/proofs/sessions?roomId=${roomId}`);
    return res.data;
  } catch (error) {
    console.error("getRoomSessionByRoomId error:", error);
    throw error;
  }
}

export async function getProofRoleSetting(
  roomSessionId: number,
  memberId: number
): Promise<{
  featureB: RoleFeatureB;
  skillDef: RoleSkillDef;
}> {
  try {
    const res = await axiosInstance.get(
      `/proofs/sessions/${roomSessionId}/roleSetting/${memberId}`
    );
    return res.data;
  } catch (error) {
    console.error("getProofRoleSetting error:", error);
    throw error;
  }
}

export async function decodeToken(token: string): Promise<DecodedUserInfo> {
  try {
    const res = await axiosInstance.post("/proofs/token", { token });
    return res.data;
  } catch (error) {
    console.error("decodeToken error:", error);
    throw error;
  }
}

export async function startProofTurn(roomSessionId: number): Promise<void> {
  try {
    await axiosInstance.post(`/proofs/sessions/${roomSessionId}/turn/start`);
  } catch (error) {
    console.error("startProofTurn error:", error);
    throw error;
  }
}
export async function startOrder(roomSessionId: number): Promise<void> {
  try {
    await axiosInstance.post(`/proofs/sessions/${roomSessionId}/order/start`);
  } catch (error) {
    console.error("startOrder error:", error);
    throw error;
  }
}

export async function endOrder(
  roomSessionId: number
): Promise<{ turnFinished: boolean; currentTurn: number }> {
  try {
    const res = await axiosInstance.post(
      `/proofs/sessions/${roomSessionId}/order/end`
    );
    return res.data;
  } catch (error) {
    console.error("endOrder error:", error);
    throw error;
  }
}

export async function judgeAlreadyRevealed(
  roomSessionId: number,
  turn: number,
  memberId: number
): Promise<boolean> {
  try {
    const res: { data: { result: boolean } } = await axiosInstance.post(
      `/proofs/judgeAlreadyRevealed`,
      {
        roomSessionId,
        turn,
        memberId,
      }
    );
    return res.data.result;
  } catch (error) {
    console.error("judgeAlreadyRevealed error:", error);
    throw error;
  }
}
export async function getProofStatus(
  roomSessionId: number,
  proofCode: string,
  memberId: number
): Promise<DTOProofStatus> {
  try {
    const res = await axiosInstance.get(
      `/proofs/sessions/${roomSessionId}/status/${proofCode}?memberId=${memberId}`
    );
    return res.data;
  } catch (error) {
    console.error("getProofStatus error:", error);
    throw error;
  }
}

export async function revealProof(
  roomSessionId: number,
  proofCode: string,
  memberId: number,
  isEntire: boolean
): Promise<RevealResult> {
  try {
    const res = await axiosInstance.post(
      `/proofs/sessions/${roomSessionId}/reveal/${proofCode}`,
      { memberId, isEntire }
    );
    return res.data;
  } catch (error) {
    console.error("revealProof error:", error);
    throw error;
  }
}

export async function applyCard(
  roomSessionId: number,
  proofCodes: string[],
  memberId: number
): Promise<boolean> {
  try {
    const res: { data: { success: boolean } } = await axiosInstance.post(
      `/proofs/sessions/${roomSessionId}/bombInit/`,
      {
        proofCodes,
        memberId,
      }
    );
    return res.data.success;
  } catch (error) {
    console.error("applyCard error:", error);
    throw error;
  }
}

export type RequestReportBody = {
  targetMemberId: number;
  proofCodes: string[];
};
export async function requestReport(
  roomSessionId: number,
  memberId: number,
  requestReportBody: RequestReportBody
): Promise<RequestReportResult> {
  try {
    const res = await axiosInstance.post(
      `/proofs/sessions/${roomSessionId}/members/${memberId}/report`,
      requestReportBody
    );
    return res.data;
  } catch (error) {
    console.error("requestReport error:", error);
    throw error;
  }
}

// proof skill

export async function useSkill(
  roomSessionId: number,
  memberId: number,
  params: unknown
): Promise<UseSkillResult> {
  try {
    const res = await axiosInstance.post(
      `/proofs/sessions/${roomSessionId}/members/${memberId}/skill`,
      { params }
    );
    return res.data;
  } catch (error) {
    console.error("useSkill error:", error);
    throw error;
  }
}

// 以下どこかに移動予定
const useSkillBomberParamSchema = z.object({
  rank: z.string(),
  code: z.string(),
});
const useSkillSwitcherParamSchema = z.object({
  rank1: z.string(),
  rank2: z.string(),
  code1: z.string(),
  code2: z.string(),
});

export type UseSkillBomberParam = z.infer<typeof useSkillBomberParamSchema>;
export type UseSkillSwitcherParam = z.infer<typeof useSkillSwitcherParamSchema>;
export const createUseSkillParam = (
  roleName: keyof typeof PROOF_ROLE_NAME_MAP,
  params: UseSkillBomberParam | UseSkillSwitcherParam
) => {
  switch (roleName) {
    case PROOF_ROLE_NAME_MAP.BOMBER:
      const useSkillBomberParam = useSkillBomberParamSchema.parse(params);
      return { code: `${useSkillBomberParam.rank}${useSkillBomberParam.code}` };
    case PROOF_ROLE_NAME_MAP.SWITCHER:
      const useSkillSwitcherParam = useSkillSwitcherParamSchema.parse(params);
      return {
        code1: `${useSkillSwitcherParam.rank1}${useSkillSwitcherParam.code1}`,
        code2: `${useSkillSwitcherParam.rank2}${useSkillSwitcherParam.code2}`,
      };
    default:
      throw new Error("Invalid role name");
  }
};
