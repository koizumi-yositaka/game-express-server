import { proofProcess } from "./proofProcess";
import { proofRepository } from "../../repos/proofRepository";
import { lineUtil } from "../../util/lineUtil";
import { toTProofRoomSessionFromProofRoomSessionWithMembers } from "../../domain/proof/typeParse";
import { toTProofFromProofList } from "../../domain/proof/typeParse";
import {
  PROOF_STATUS,
  PROOF_MEMBER_STATUS,
  PROOF_ROLE_NAME_MAP,
  PROOF_ADMIN_USER_ID,
} from "../../domain/proof/proofCommon";
import { REVEALED_RESULT_CODE } from "../../domain/proof/types";
import { NotFoundError } from "../../error/AppError";
import { Prisma } from "../../generated/prisma/client";
import { Server } from "socket.io";

// モックのセットアップ
jest.mock("../../repos/proofRepository");
jest.mock("../../util/lineUtil");
jest.mock("../../domain/proof/typeParse");

/**
 * revealProofProcess パラメータ別結果表
 *
 * | proof.status      | bomFlg | revealedBy.roleId | isEntire | 既に開示済み(revealedBy) | 結果コード              | メッセージ                     |
 * |-------------------|--------|-------------------|----------|-------------------------|------------------------|--------------------------------|
 * | NORMAL            | false  | 任意              | false    | 0                       | SUCCESS                | このカードは開示されました      |
 * | NORMAL            | false  | 任意              | true     | 0                       | SUCCESS                | このカードは開示されました      |
 * | REVEALED_TO_ALL   | 任意   | 任意              | 任意     | 任意(≠0)                | ALREADY_REVEALED       | このカードはすでに開示されています |
 * | REVEALED_TO_ONE   | 任意   | 任意              | true     | 任意(≠0)                | SUCCESS                | このカードは開示されました      |
 * | REVEALED_TO_ONE   | 任意   | 任意              | false    | 同じmember              | ALREADY_REVEALED       | このカードはすでにあなたには開示されています |
 * | REVEALED_TO_ONE   | 任意   | 任意              | false    | 異なるmember            | SUCCESS                | このカードは開示されました      |
 * | NORMAL            | true   | 1(ボマー)         | 任意     | 0                       | SUCCESS                | このカードは開示されました      |
 * | NORMAL            | true   | 2(鑑定士)         | false    | 0                       | DISARM_SUCCESS         | 爆弾を解除しました              |
 * | NORMAL            | true   | 2(鑑定士)         | true     | 0                       | BOMBED                 | このカードは爆弾です            |
 * | NORMAL            | true   | 3(その他)         | false    | 0                       | BOMBED                 | このカードは爆弾です            |
 * | NORMAL            | true   | 3(その他)         | true     | 0                       | BOMBED                 | このカードは爆弾です            |
 */

describe("proofProcess.revealProofProcess", () => {
  const mockTx = {} as Prisma.TransactionClient;
  const mockIo = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn(),
  } as unknown as Server;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    // toTProofFromProofListのモックを実装に合わせて設定
    (toTProofFromProofList as jest.Mock).mockImplementation((proof: any) => {
      return {
        id: proof.id,
        roomSessionId: proof.roomSessionId,
        code: proof.code,
        rank: proof.rank,
        status: proof.status,
        title: proof.title,
        description: proof.description,
        refer: proof.refer || "",
        bomFlg: proof.bomFlg || false,
        revealedBy:
          proof.revealedBy && proof.revealedBy !== ""
            ? proof.revealedBy.split(",").map((id: string) => parseInt(id))
            : [],
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // パラメータ別結果表を出力する関数
  const printParameterTable = () => {
    const table = `
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║ revealProofProcess パラメータ別結果表                                                                                                    ║
╠════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
║ proof.status      │ bomFlg │ revealedBy.roleId │ isEntire │ 既に開示済み(revealedBy) │ 結果コード              │ メッセージ                     ║
╠═══════════════════╪════════╪═══════════════════╪══════════╪═════════════════════════╪═════════════════════════╪════════════════════════════════╣
║ NORMAL            │ false  │ 任意              │ false    │ 0                       │ SUCCESS                 │ このカードは開示されました      ║
║ NORMAL            │ false  │ 任意              │ true     │ 0                       │ SUCCESS                 │ このカードは開示されました      ║
║ REVEALED_TO_ALL   │ 任意   │ 任意              │ 任意     │ 任意(≠0)                │ ALREADY_REVEALED        │ このカードはすでに開示されています ║
║ REVEALED_TO_ONE   │ 任意   │ 任意              │ true     │ 任意(≠0)                │ SUCCESS                 │ このカードは開示されました      ║
║ REVEALED_TO_ONE   │ 任意   │ 任意              │ false    │ 同じmember              │ ALREADY_REVEALED        │ このカードはすでにあなたには開示されています ║
║ REVEALED_TO_ONE   │ 任意   │ 任意              │ false    │ 異なるmember            │ SUCCESS                 │ このカードは開示されました      ║
║ NORMAL            │ true   │ 1(ボマー)         │ 任意     │ 0                       │ SUCCESS                 │ このカードは開示されました      ║
║ NORMAL            │ true   │ 2(鑑定士)         │ false    │ 0                       │ DISARM_SUCCESS          │ 爆弾を解除しました              ║
║ NORMAL            │ true   │ 2(鑑定士)         │ true     │ 0                       │ BOMBED                  │ このカードは爆弾です            ║
║ NORMAL            │ true   │ 3(その他)         │ false    │ 0                       │ BOMBED                  │ このカードは爆弾です            ║
║ NORMAL            │ true   │ 3(その他)         │ true     │ 0                       │ BOMBED                  │ このカードは爆弾です            ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
`;
    console.log(table);
  };

  afterAll(() => {
    // console.logのモックを一時的に解除して表を出力
    const originalLog = console.log;
    jest.restoreAllMocks();
    printParameterTable();
    // モックを再設定（他のテストに影響しないように）
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  const createMockRoomSession = (members: any[]) => {
    return {
      id: 1,
      roomId: 1,
      turn: 1,
      status: 1,
      setting: "{}",
      room: {
        id: 1,
        roomCode: "TEST",
        status: 1,
        openFlg: true,
        createdAt: new Date(),
        members: members,
      },
    };
  };

  const createMockMember = (
    id: number,
    userId: string,
    roleId: number,
    status: number = PROOF_MEMBER_STATUS.ENTERED
  ) => {
    return {
      id,
      roomId: 1,
      userId,
      roleId,
      status,
      sort: 0,
      joinedAt: new Date(),
      user: {
        userId,
        displayName: `User ${id}`,
        invalidateFlg: false,
        createdAt: new Date(),
      },
      role: {
        roleId,
        roleName:
          roleId === 1
            ? PROOF_ROLE_NAME_MAP.BOMBER
            : roleId === 2
            ? PROOF_ROLE_NAME_MAP.BOMB_SQUAD
            : "その他",
        priority: 1,
        description: "",
        imageUrl: "",
        notionUrl: "",
        group: 1,
      },
    };
  };

  const createMockProof = (
    id: number,
    code: string,
    status: string,
    revealedBy: number[] = [],
    bomFlg: boolean = false
  ) => {
    // DBから取得されるProofList型（revealedByはstring）
    return {
      id,
      roomSessionId: 1,
      code,
      rank: "A",
      status,
      title: "Test Proof",
      description: "Test Description",
      revealedBy: revealedBy.length > 0 ? revealedBy.join(",") : "",
      bomFlg,
    };
  };

  const createMockTProofRoomSession = (members: any[]) => {
    return {
      id: 1,
      roomId: 1,
      turn: 1,
      status: 1,
      setting: "{}",
      room: {
        id: 1,
        roomCode: "TEST",
        status: 1,
        openFlg: true,
        createdAt: new Date(),
        members: members.map((m) => ({
          id: m.id,
          roomId: 1,
          userId: m.userId,
          roleId: m.roleId,
          status: m.status,
          sort: 0,
          joinedAt: new Date(),
          user: m.user,
          role: m.role,
        })),
      },
    };
  };

  describe("正常系: 通常のproofを開示", () => {
    it("isEntire: false の場合、個人開示として処理される", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, []);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ONE,
        [1],
        false
      );
      const tProofRoomSession = createMockTProofRoomSession([member1]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ONE,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: false,
        revealedBy: [1],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(result.message).toBe("このカードは開示されました");
      expect(result.proof).toEqual(tProof);
      expect(proofRepository.updateProofStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        {
          status: PROOF_STATUS.REVEALED_TO_ONE,
          revealedBy: "1",
          revealedTurn: 1,
        }
      );
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "Test ProofTest Description"
      );
    });

    it("isEntire: true の場合、全体開示として処理される", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const member2 = createMockMember(2, "user2", 4);
      const roomSession = createMockRoomSession([member1, member2]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, []);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ALL,
        [1]
      );
      const tProofRoomSession = createMockTProofRoomSession([member1, member2]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ALL,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: false,
        revealedBy: [1],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: true,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(result.message).toBe("このカードは開示されました");
      expect(result.proof).toEqual(tProof);
      expect(proofRepository.updateProofStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        {
          status: PROOF_STATUS.REVEALED_TO_ALL,
          revealedBy: "1",
          revealedTurn: 1,
        }
      );
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledTimes(2);
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "Test ProofTest Description"
      );
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user2",
        "Test ProofTest Description"
      );
      expect(mockIo.to).toHaveBeenCalledWith(`user:${PROOF_ADMIN_USER_ID}`);
      expect(mockIo.emit).toHaveBeenCalledWith("proof:revealResult", {
        result: REVEALED_RESULT_CODE.SUCCESS,
        message: "User 1がカード「ACODE1」を開示しました",
        proof: tProof,
      });
    });
  });

  describe("既に開示済みのproof", () => {
    it("REVEALED_TO_ALL の場合、SUCCESSを返す", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.REVEALED_TO_ALL, [
        1,
      ]);
      const tProofRoomSession = createMockTProofRoomSession([member1]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.ALREADY_REVEALED);
      expect(result.message).toBe("このカードはすでに開示されています");
      expect(proofRepository.updateProofStatus).not.toHaveBeenCalled();
    });

    it("REVEALED_TO_ONE で、同じmemberが開示する場合（isEntire: false）、ALREADY_REVEALEDを返す", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.REVEALED_TO_ONE, [
        1,
      ]);
      const tProofRoomSession = createMockTProofRoomSession([member1]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.ALREADY_REVEALED);
      expect(result.message).toBe(
        "このカードはすでにあなたには開示されています"
      );
      expect(proofRepository.updateProofStatus).not.toHaveBeenCalled();
    });

    it("REVEALED_TO_ONE で、同じmemberが開示する場合（isEntire: true）、正常に処理される", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.REVEALED_TO_ONE, [
        1,
      ]);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ALL,
        [1]
      );
      const tProofRoomSession = createMockTProofRoomSession([member1]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ALL,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: false,
        revealedBy: [1],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: true,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(proofRepository.updateProofStatus).toHaveBeenCalled();
      expect(mockIo.to).toHaveBeenCalledWith(`user:${PROOF_ADMIN_USER_ID}`);
      expect(mockIo.emit).toHaveBeenCalledWith("proof:revealResult", {
        result: REVEALED_RESULT_CODE.SUCCESS,
        message: "User 1がカード「ACODE1」を開示しました",
        proof: tProof,
      });
    });

    it("REVEALED_TO_ONE で、異なるmemberが開示する場合（isEntire: false）、正常に処理される", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const member2 = createMockMember(2, "user2", 4);
      const roomSession = createMockRoomSession([member1, member2]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.REVEALED_TO_ONE, [
        1,
      ]);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ONE,
        [1, 2]
      );
      const tProofRoomSession = createMockTProofRoomSession([member1, member2]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ONE,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: false,
        revealedBy: [1, 2],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 2,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(result.message).toBe("このカードは開示されました");
      expect(result.proof).toEqual(tProof);
      expect(proofRepository.updateProofStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        {
          status: PROOF_STATUS.REVEALED_TO_ONE,
          revealedBy: "1,2",
          revealedTurn: 1,
        }
      );
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user2",
        "Test ProofTest Description"
      );
    });

    it("REVEALED_TO_ONE で、異なるmemberが開示する場合（isEntire: true）、正常に処理される", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const member2 = createMockMember(2, "user2", 4);
      const roomSession = createMockRoomSession([member1, member2]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.REVEALED_TO_ONE, [
        1,
      ]);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ALL,
        [1, 2]
      );
      const tProofRoomSession = createMockTProofRoomSession([member1, member2]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ALL,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: false,
        revealedBy: [1, 2],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 2,
        isEntire: true,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(proofRepository.updateProofStatus).toHaveBeenCalled();
      expect(mockIo.to).toHaveBeenCalledWith(`user:${PROOF_ADMIN_USER_ID}`);
      expect(mockIo.emit).toHaveBeenCalledWith("proof:revealResult", {
        result: REVEALED_RESULT_CODE.SUCCESS,
        message: "User 2がカード「ACODE1」を開示しました",
        proof: tProof,
      });
    });
  });

  describe("爆弾のproof", () => {
    it("roleName: BOMBER（ボマー）が開示する場合、SUCCESSを返す", async () => {
      const member1 = createMockMember(1, "user1", 1); // ボマー
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, [], true);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ONE,
        [1],
        true
      );
      const tProofRoomSession = createMockTProofRoomSession([member1]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ONE,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: true,
        revealedBy: [1],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.SUCCESS);
      expect(result.message).toBe("このカードは開示されました");
      expect(result.proof).toEqual(tProof);
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "Test ProofTest Description"
      );
    });

    it("roleName: BOMB_SQUAD（鑑定士）が開示する場合、DISARM_SUCCESSを返す（isEntire: false）", async () => {
      const member1 = createMockMember(1, "user1", 2); // 鑑定士
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, [], true);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ONE,
        [1],
        true
      );
      const tProofRoomSession = createMockTProofRoomSession([member1]);
      const tProof = {
        id: 1,
        roomSessionId: 1,
        code: "CODE1",
        rank: "A",
        status: PROOF_STATUS.REVEALED_TO_ONE,
        title: "Test Proof",
        description: "Test Description",
        refer: "",
        bomFlg: true,
        revealedBy: [1],
      };

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.DISARM_SUCCESS);
      expect(result.message).toBe("爆弾を解除しました");
      expect(result.proof).toEqual(tProof);
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "Test ProofTest Description"
      );
    });

    it("roleName: BOMB_SQUAD（鑑定士）が全体開示する場合、BOMBEDを返す（isEntire: true）", async () => {
      const member1 = createMockMember(1, "user1", 2); // 鑑定士
      const member2 = createMockMember(2, "user2", 3);
      const roomSession = createMockRoomSession([member1, member2]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, [], true);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ALL,
        [1],
        true
      );
      const tProofRoomSession = createMockTProofRoomSession([member1, member2]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });
      (proofRepository.updateRoomMemberStatus as jest.Mock).mockResolvedValue(
        null
      );

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: true,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.BOMBED);
      expect(result.message).toBe("このカードは爆弾です");
      expect(mockIo.to).toHaveBeenCalledWith(`user:${PROOF_ADMIN_USER_ID}`);
      expect(mockIo.emit).toHaveBeenCalledWith("proof:revealResult", {
        result: REVEALED_RESULT_CODE.BOMBED,
        message: "このカードは爆弾です",
      });
    });

    it("roleName: その他が開示する場合、BOMBEDを返す（isEntire: false）", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, [], true);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ONE,
        [1],
        true
      );
      const tProofRoomSession = createMockTProofRoomSession([member1]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });
      (proofRepository.updateRoomMemberStatus as jest.Mock).mockResolvedValue(
        null
      );

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: false,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.BOMBED);
      expect(result.message).toBe("このカードは爆弾です");
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "爆死です"
      );
      expect(proofRepository.updateRoomMemberStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        "user1",
        PROOF_MEMBER_STATUS.RETIRED
      );
    });

    it("roleName: その他が開示する場合、BOMBEDを返す（isEntire: true）", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const member2 = createMockMember(2, "user2", 1); // ボマー
      const member3 = createMockMember(3, "user3", 4);
      const roomSession = createMockRoomSession([member1, member2, member3]);
      const proof = createMockProof(1, "CODE1", PROOF_STATUS.NORMAL, [], true);
      const updatedProof = createMockProof(
        1,
        "CODE1",
        PROOF_STATUS.REVEALED_TO_ALL,
        [1],
        true
      );
      const tProofRoomSession = createMockTProofRoomSession([
        member1,
        member2,
        member3,
      ]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(proof);
      (proofRepository.updateProofStatus as jest.Mock).mockResolvedValue(
        updatedProof
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);
      (lineUtil.sendSimpleTextMessage as jest.Mock).mockResolvedValue({
        success: true,
      });
      (proofRepository.updateRoomMemberStatus as jest.Mock).mockResolvedValue(
        null
      );

      const result = await proofProcess.revealProofProcess(mockTx, mockIo, {
        roomSessionId: 1,
        code: "CODE1",
        revealedBy: 1,
        isEntire: true,
      });

      expect(result.result).toBe(REVEALED_RESULT_CODE.BOMBED);
      expect(result.message).toBe("このカードは爆弾です");
      // socket.ioでemitされる
      expect(mockIo.to).toHaveBeenCalledWith(`user:${PROOF_ADMIN_USER_ID}`);
      expect(mockIo.emit).toHaveBeenCalledWith("proof:revealResult", {
        result: REVEALED_RESULT_CODE.BOMBED,
        message: "このカードは爆弾です",
      });
      // ボマー以外に爆死メッセージを送信
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user1",
        "爆死です。ボマーの勝利です"
      );
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user3",
        "爆死です。ボマーの勝利です"
      );
      // ボマーには勝利メッセージ
      expect(lineUtil.sendSimpleTextMessage).toHaveBeenCalledWith(
        "user2",
        "ボマーの勝利です"
      );
      // ボマー以外のステータスを更新
      expect(proofRepository.updateRoomMemberStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        "user1",
        PROOF_MEMBER_STATUS.RETIRED
      );
      expect(proofRepository.updateRoomMemberStatus).toHaveBeenCalledWith(
        mockTx,
        1,
        "user3",
        PROOF_MEMBER_STATUS.RETIRED
      );
    });
  });

  describe("エラーケース", () => {
    it("Room sessionが見つからない場合、NotFoundErrorをスローする", async () => {
      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(null);

      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 999,
          code: "CODE1",
          revealedBy: 1,
          isEntire: false,
        })
      ).rejects.toThrow(NotFoundError);
      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 999,
          code: "CODE1",
          revealedBy: 1,
          isEntire: false,
        })
      ).rejects.toThrow("Room session not found");
    });

    it("Memberが見つからない場合、NotFoundErrorをスローする", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const tProofRoomSession = createMockTProofRoomSession([member1]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);

      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 1,
          code: "CODE1",
          revealedBy: 999,
          isEntire: false,
        })
      ).rejects.toThrow(NotFoundError);
      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 1,
          code: "CODE1",
          revealedBy: 999,
          isEntire: false,
        })
      ).rejects.toThrow("Member not found");
    });

    it("Proofが見つからない場合、NotFoundErrorをスローする", async () => {
      const member1 = createMockMember(1, "user1", 3);
      const roomSession = createMockRoomSession([member1]);
      const tProofRoomSession = createMockTProofRoomSession([member1]);

      (proofRepository.getRoomSession as jest.Mock).mockResolvedValue(
        roomSession
      );
      (
        proofRepository.getProofByRoomSessionIdAndCode as jest.Mock
      ).mockResolvedValue(null);
      (
        toTProofRoomSessionFromProofRoomSessionWithMembers as jest.Mock
      ).mockReturnValue(tProofRoomSession);

      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 1,
          code: "INVALID_CODE",
          revealedBy: 1,
          isEntire: false,
        })
      ).rejects.toThrow(NotFoundError);
      await expect(
        proofProcess.revealProofProcess(mockTx, mockIo, {
          roomSessionId: 1,
          code: "INVALID_CODE",
          revealedBy: 1,
          isEntire: false,
        })
      ).rejects.toThrow("Proof not found");
    });
  });
});
