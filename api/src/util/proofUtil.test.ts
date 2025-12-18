import { proofUtil } from "./proofUtil";
import {
  DEFAULT_PROOF_COUNT,
  PROOF_RANK,
  PROOF_STATUS,
  PROOF_BOMB_RESERVED_WORD,
} from "../domain/proof/proofCommon";
import {
  TProofRoomSession,
  TProofRoomMember,
  TProofRole,
  TUser,
} from "../domain/proof/types";

describe("proofUtil.createGameSetting", () => {
  const bomberInfoCardCount = 1;

  describe("参加人数が4人の場合", () => {
    it("Aが6枚、Bが10枚、Cが24枚になる", async () => {
      const memberCount = 4;
      const result = await proofUtil.createGameSetting(memberCount);

      // Aの枚数: memberCount + A_DUMMY + bomberInfoCardCount = 4 + 1 + 1 = 6
      expect(result.cardCount.aCount).toBe(6);
      // Bの枚数: memberCount * 2 + B_DUMMY = 4 * 2 + 2 = 10
      expect(result.cardCount.bCount).toBe(10);
      // Cの枚数: (C_MAPの合計) * memberCount + C_DUMMY = 6 * 4 + 0 = 24
      const cMapSum = Object.values(DEFAULT_PROOF_COUNT.C_MAP).reduce(
        (acc, curr) => acc + curr,
        0
      );
      expect(result.cardCount.cCount).toBe(
        cMapSum * memberCount + DEFAULT_PROOF_COUNT.C_DUMMY
      );
      expect(result.cardCount.cCount).toBe(24);
    });

    it("Cはtype1~type6までがそれぞれ4枚ずつ", () => {
      const memberCount = 4;
      const cMap = DEFAULT_PROOF_COUNT.C_MAP;

      // 各typeの枚数は C_MAPの値 * memberCount
      Object.values(cMap).forEach((count) => {
        expect(count * memberCount).toBe(4);
      });

      // C_MAPの各typeの値が1であることを確認
      expect(cMap.type1).toBe(1);
      expect(cMap.type2).toBe(1);
      expect(cMap.type3).toBe(1);
      expect(cMap.type4).toBe(1);
      expect(cMap.type5).toBe(1);
      expect(cMap.type6).toBe(1);
    });

    it("Aにはdummyが1枚、Bにはdummyが2枚、Cにはdummyが0枚", async () => {
      const memberCount = 4;
      const result = await proofUtil.createGameSetting(memberCount);

      expect(result.cardCount.aDummyCount).toBe(DEFAULT_PROOF_COUNT.A_DUMMY);
      expect(result.cardCount.aDummyCount).toBe(1);
      expect(result.cardCount.bDummyCount).toBe(DEFAULT_PROOF_COUNT.B_DUMMY);
      expect(result.cardCount.bDummyCount).toBe(2);
      expect(result.cardCount.cDummyCount).toBe(DEFAULT_PROOF_COUNT.C_DUMMY);
      expect(result.cardCount.cDummyCount).toBe(0);
    });
  });

  describe("参加人数が5人の場合", () => {
    it("Aが7枚、Bが12枚、Cが30枚になる", async () => {
      const memberCount = 5;
      const result = await proofUtil.createGameSetting(memberCount);

      // Aの枚数: memberCount + A_DUMMY + bomberInfoCardCount = 5 + 1 + 1 = 7
      expect(result.cardCount.aCount).toBe(7);
      // Bの枚数: memberCount * 2 + B_DUMMY = 5 * 2 + 2 = 12
      expect(result.cardCount.bCount).toBe(12);
      // Cの枚数: (C_MAPの合計) * memberCount + C_DUMMY = 6 * 5 + 0 = 30
      const cMapSum = Object.values(DEFAULT_PROOF_COUNT.C_MAP).reduce(
        (acc, curr) => acc + curr,
        0
      );
      expect(result.cardCount.cCount).toBe(
        cMapSum * memberCount + DEFAULT_PROOF_COUNT.C_DUMMY
      );
      expect(result.cardCount.cCount).toBe(30);
    });

    it("Cはtype1~type6までがそれぞれ5枚ずつ", () => {
      const memberCount = 5;
      const cMap = DEFAULT_PROOF_COUNT.C_MAP;

      // 各typeの枚数は C_MAPの値 * memberCount
      Object.values(cMap).forEach((count) => {
        expect(count * memberCount).toBe(5);
      });
    });

    it("Aにはdummyが1枚、Bにはdummyが2枚、Cにはdummyが0枚", async () => {
      const memberCount = 5;
      const result = await proofUtil.createGameSetting(memberCount);

      expect(result.cardCount.aDummyCount).toBe(DEFAULT_PROOF_COUNT.A_DUMMY);
      expect(result.cardCount.aDummyCount).toBe(1);
      expect(result.cardCount.bDummyCount).toBe(DEFAULT_PROOF_COUNT.B_DUMMY);
      expect(result.cardCount.bDummyCount).toBe(2);
      expect(result.cardCount.cDummyCount).toBe(DEFAULT_PROOF_COUNT.C_DUMMY);
      expect(result.cardCount.cDummyCount).toBe(0);
    });
  });

  describe("参加人数が6人の場合", () => {
    it("Aが8枚、Bが14枚、Cが36枚になる", async () => {
      const memberCount = 6;
      const result = await proofUtil.createGameSetting(memberCount);

      // Aの枚数: memberCount + A_DUMMY + bomberInfoCardCount = 6 + 1 + 1 = 8
      expect(result.cardCount.aCount).toBe(8);
      // Bの枚数: memberCount * 2 + B_DUMMY = 6 * 2 + 2 = 14
      expect(result.cardCount.bCount).toBe(14);
      // Cの枚数: (C_MAPの合計) * memberCount + C_DUMMY = 6 * 6 + 0 = 36
      const cMapSum = Object.values(DEFAULT_PROOF_COUNT.C_MAP).reduce(
        (acc, curr) => acc + curr,
        0
      );
      expect(result.cardCount.cCount).toBe(
        cMapSum * memberCount + DEFAULT_PROOF_COUNT.C_DUMMY
      );
      expect(result.cardCount.cCount).toBe(36);
    });

    it("Cはtype1~type6までがそれぞれ6枚ずつ", () => {
      const memberCount = 6;
      const cMap = DEFAULT_PROOF_COUNT.C_MAP;

      // 各typeの枚数は C_MAPの値 * memberCount
      Object.values(cMap).forEach((count) => {
        expect(count * memberCount).toBe(6);
      });
    });

    it("Aにはdummyが1枚、Bにはdummyが2枚、Cにはdummyが0枚", async () => {
      const memberCount = 6;
      const result = await proofUtil.createGameSetting(memberCount);

      expect(result.cardCount.aDummyCount).toBe(DEFAULT_PROOF_COUNT.A_DUMMY);
      expect(result.cardCount.aDummyCount).toBe(1);
      expect(result.cardCount.bDummyCount).toBe(DEFAULT_PROOF_COUNT.B_DUMMY);
      expect(result.cardCount.bDummyCount).toBe(2);
      expect(result.cardCount.cDummyCount).toBe(DEFAULT_PROOF_COUNT.C_DUMMY);
      expect(result.cardCount.cDummyCount).toBe(0);
    });
  });
});

describe("proofUtil.createProofs", () => {
  const mockRoles: TProofRole[] = [
    {
      roleId: 1,
      roleName: "BOMBER",
      priority: 1,
      description: "ボマー",
      imageUrl: "",
      notionUrl: "",
      group: 1,
    },
    {
      roleId: 2,
      roleName: "BOMB_SQUAD",
      priority: 2,
      description: "鑑定士",
      imageUrl: "",
      notionUrl: "",
      group: 1,
    },
    {
      roleId: 3,
      roleName: "STRENGTH",
      priority: 3,
      description: "力士",
      imageUrl: "",
      notionUrl: "",
      group: 1,
    },
    {
      roleId: 4,
      roleName: "SWITCHER",
      priority: 4,
      description: "スイッチャー",
      imageUrl: "",
      notionUrl: "",
      group: 2,
    },
  ];

  const createMockProofRoomSession = (
    memberCount: number
  ): TProofRoomSession => {
    const members: TProofRoomMember[] = [];
    const roles = mockRoles;

    for (let i = 0; i < memberCount; i++) {
      const user: TUser = {
        userId: `user${i + 1}`,
        displayName: `User${i + 1}`,
        invalidateFlg: false,
      };
      members.push({
        id: i + 1,
        roomId: 1,
        userId: `user${i + 1}`,
        roleId: roles[i % roles.length].roleId,
        status: 0,
        isSkillUsed: false,
        sort: i,
        skillUsedTime: 0,
        penalty: [],
        joinedAt: new Date(),
        user: user,
        role: roles[i % roles.length],
      });
    }

    return {
      id: 1,
      roomId: 1,
      turn: 1,
      status: 0,
      setting: "",
      focusOn: 0,
      room: {
        id: 1,
        roomCode: "TEST",
        status: 0,
        openFlg: true,
        createdAt: new Date(),
        members: members,
      },
    };
  };

  describe("参加人数が4人の場合", () => {
    it("Aのreferは参加者のmemberIDが設定されているものがそれぞれ1枚あること", async () => {
      const memberCount = 4;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      // AランクのProofを抽出
      const aProofs = proofs.filter((p) => p.rank === PROOF_RANK.A);

      // 通常のAカード（BOMBカードとdummyを除く）を抽出
      const normalAProofs = aProofs.filter(
        (p) =>
          p.status === PROOF_STATUS.NORMAL &&
          p.title !== PROOF_BOMB_RESERVED_WORD
      );

      // 各メンバーに対して1枚ずつAカードがあることを確認
      expect(normalAProofs.length).toBe(memberCount);

      // 各メンバーのIDに対してreferが設定されていることを確認
      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalAProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        expect(memberProofs.length).toBe(1);
      });
    });

    it("Bのreferは参加者のmemberIDが設定されているものがそれぞれ2枚あること", async () => {
      const memberCount = 4;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      // BランクのProofを抽出
      const bProofs = proofs.filter((p) => p.rank === PROOF_RANK.B);

      // 通常のBカード（dummyを除く）を抽出
      const normalBProofs = bProofs.filter(
        (p) => p.status === PROOF_STATUS.NORMAL
      );

      // 各メンバーに対して2枚ずつBカードがあることを確認
      expect(normalBProofs.length).toBe(memberCount * 2);

      // 各メンバーのIDに対してreferが設定されていることを確認
      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalBProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        // 各メンバーに対して2枚のBカードがあることを確認
        expect(memberProofs.length).toBe(2);
      });
    });

    it("Cのreferはなし", async () => {
      const memberCount = 4;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      // CランクのProofを抽出
      const cProofs = proofs.filter((p) => p.rank === PROOF_RANK.C);

      // すべてのCカードのreferが空文字列であることを確認
      cProofs.forEach((proof) => {
        expect(proof.refer).toBe("");
      });
    });
  });

  describe("参加人数が5人の場合", () => {
    it("Aのreferは参加者のmemberIDが設定されているものがそれぞれ1枚あること", async () => {
      const memberCount = 5;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const aProofs = proofs.filter((p) => p.rank === PROOF_RANK.A);
      const normalAProofs = aProofs.filter(
        (p) =>
          p.status === PROOF_STATUS.NORMAL &&
          p.title !== PROOF_BOMB_RESERVED_WORD
      );

      expect(normalAProofs.length).toBe(memberCount);

      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalAProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        expect(memberProofs.length).toBe(1);
      });
    });

    it("Bのreferは参加者のmemberIDが設定されているものがそれぞれ2枚あること", async () => {
      const memberCount = 5;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const bProofs = proofs.filter((p) => p.rank === PROOF_RANK.B);
      const normalBProofs = bProofs.filter(
        (p) => p.status === PROOF_STATUS.NORMAL
      );

      expect(normalBProofs.length).toBe(memberCount * 2);

      // 各メンバーのIDに対してreferが設定されていることを確認
      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalBProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        // 各メンバーに対して2枚のBカードがあることを確認
        expect(memberProofs.length).toBe(2);
      });
    });

    it("Cのreferはなし", async () => {
      const memberCount = 5;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const cProofs = proofs.filter((p) => p.rank === PROOF_RANK.C);
      cProofs.forEach((proof) => {
        expect(proof.refer).toBe("");
      });
    });
  });

  describe("参加人数が6人の場合", () => {
    it("Aのreferは参加者のmemberIDが設定されているものがそれぞれ1枚あること", async () => {
      const memberCount = 6;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const aProofs = proofs.filter((p) => p.rank === PROOF_RANK.A);
      const normalAProofs = aProofs.filter(
        (p) =>
          p.status === PROOF_STATUS.NORMAL &&
          p.title !== PROOF_BOMB_RESERVED_WORD
      );

      expect(normalAProofs.length).toBe(memberCount);

      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalAProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        expect(memberProofs.length).toBe(1);
      });
    });

    it("Bのreferは参加者のmemberIDが設定されているものがそれぞれ2枚あること", async () => {
      const memberCount = 6;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const bProofs = proofs.filter((p) => p.rank === PROOF_RANK.B);
      const normalBProofs = bProofs.filter(
        (p) => p.status === PROOF_STATUS.NORMAL
      );

      expect(normalBProofs.length).toBe(memberCount * 2);

      // 各メンバーのIDに対してreferが設定されていることを確認
      const memberIds = proofRoomSession.room.members.map((m) => m.id);
      memberIds.forEach((memberId) => {
        const memberProofs = normalBProofs.filter(
          (p) => p.refer === `member:${memberId}`
        );
        // 各メンバーに対して2枚のBカードがあることを確認
        expect(memberProofs.length).toBe(2);
      });
    });

    it("Cのreferはなし", async () => {
      const memberCount = 6;
      const setting = await proofUtil.createGameSetting(memberCount);
      const proofRoomSession = createMockProofRoomSession(memberCount);
      const proofs = await proofUtil.createProofs(
        setting,
        proofRoomSession,
        mockRoles
      );

      const cProofs = proofs.filter((p) => p.rank === PROOF_RANK.C);
      cProofs.forEach((proof) => {
        expect(proof.refer).toBe("");
      });
    });
  });
});
