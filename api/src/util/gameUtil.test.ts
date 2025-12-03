import {
  executeCommand,
  getAvailableCommandsByRole,
  gameUtil,
} from "./gameUtil";
import {
  TCommand,
  TCommandType,
  TDirection,
  TRole,
  TRoomSession,
  TRoomMember,
} from "../domain/types";
import { jsonRW } from "./jsonRW";

import { COMMAND_BUTTON_DATA_MAP, DEFAULT_SETTING } from "../domain/common";

// モックのセットアップ
jest.mock("./jsonRW");
jest.mock("../roles/roleSpecialMoveExecutor");

describe("gameUtil", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.log のモック（オプション）
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("executeCommand", () => {
    const createMockRoomSession = (
      members: Array<{ id: number; role?: { roleName: string } | null }>
    ): TRoomSession => {
      return {
        id: 1,
        roomId: 1,
        posX: 3,
        posY: 3,
        turn: 1,
        direction: "N" as TDirection,
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
            userId: "user1",
            roleId: 1,
            status: 0,
            joinedAt: new Date(),
            role: m.role
              ? {
                  roleId: 1,
                  roleName: m.role.roleName,
                  priority: 1,
                  description: "",
                  imageUrl: "",
                  notionUrl: "",
                  group: 1,
                }
              : undefined,
          })),
        },
        commands: [],
      };
    };

    describe("TURN_RIGHT", () => {
      it("N方向から右を向くとEになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_RIGHT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "N" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("E");
        expect(result.posX).toBe(3);
        expect(result.posY).toBe(3);
      });

      it("E方向から右を向くとSになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_RIGHT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "E" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("S");
      });

      it("S方向から右を向くとWになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_RIGHT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "S" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("W");
      });

      it("W方向から右を向くとNになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_RIGHT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "W" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("N");
      });
    });

    describe("TURN_LEFT", () => {
      it("N方向から左を向くとWになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_LEFT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "N" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("W");
      });

      it("W方向から左を向くとSになる", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "TURN_LEFT",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "W" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.direction).toBe("S");
      });
    });

    describe("FORWARD", () => {
      it("N方向に前進するとposYが1減る", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "N" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posY).toBe(2);
        expect(result.posX).toBe(3);
        expect(result.direction).toBe("N");
      });

      it("S方向に前進するとposYが1増える", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "S" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posY).toBe(4);
        expect(result.posX).toBe(3);
      });

      it("E方向に前進するとposXが1増える", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "E" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posX).toBe(4);
        expect(result.posY).toBe(3);
      });

      it("W方向に前進するとposXが1減る", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "W" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posX).toBe(2);
        expect(result.posY).toBe(3);
      });

      it("N方向で境界外（posY=0）の場合、前進しない", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 0, direction: "N" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posY).toBe(0);
      });

      it("S方向で境界外（posY=maxY-1）の場合、前進しない", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 6, direction: "S" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posY).toBe(6);
      });

      it("E方向で境界外（posX=maxX-1）の場合、前進しない", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 6, posY: 3, direction: "E" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posX).toBe(6);
      });

      it("W方向で境界外（posX=0）の場合、前進しない", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "FORWARD",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 0, posY: 3, direction: "W" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posX).toBe(0);
      });
    });

    describe("SKIP", () => {
      it("SKIPコマンドで位置が変わらない", () => {
        const command: TCommand = {
          roomSessionId: 1,
          memberId: 1,
          commandType: "SKIP",
          processed: false,
          arg: "",
        };
        const gridInfo = {
          location: { posX: 3, posY: 3, direction: "N" as TDirection },
          goalCell: [[0, 0]] as [number, number][],
          maxX: 7,
          maxY: 7,
        };
        const roomSession = createMockRoomSession([{ id: 1 }]);

        const result = executeCommand(command, gridInfo, roomSession);

        expect(result.posX).toBe(3);
        expect(result.posY).toBe(3);
        expect(result.direction).toBe("N");
      });
    });

    // describe("SPECIAL", () => {
    //   it("SPECIALコマンドでroleSpecialMoveExecutorが呼ばれる", () => {
    //     const mockExecuteSpecialMove = jest.fn();
    //     (roleSpecialMoveExecutor.executeSpecialMove as jest.Mock) =
    //       mockExecuteSpecialMove;

    //     const command: TCommand = {
    //       roomSessionId: 1,
    //       memberId: 1,
    //       commandType: "SPECIAL",
    //       processed: false,
    //       arg: "",
    //     };
    //     const gridInfo = {
    //       location: { posX: 3, posY: 3, direction: "N" as TDirection },
    //       goalCell: [[0, 0]] as [number, number][],
    //       maxX: 7,
    //       maxY: 7,
    //     };
    //     const roomSession = createMockRoomSession([
    //       { id: 1, role: { roleName: "EMPEROR" } },
    //     ]);

    //     const result = executeCommand(command, gridInfo, roomSession);

    //     expect(mockExecuteSpecialMove).toHaveBeenCalledWith("EMPEROR");
    //     expect(result.posX).toBe(3);
    //     expect(result.posY).toBe(3);
    //     expect(result.direction).toBe("N");
    //   });

    //   it("メンバーが見つからない場合、NotFoundErrorをスローする", () => {
    //     const command: TCommand = {
    //       roomSessionId: 1,
    //       memberId: 999,
    //       commandType: "SPECIAL",
    //       processed: false,
    //       arg: "",
    //     };
    //     const gridInfo = {
    //       location: { posX: 3, posY: 3, direction: "N" as TDirection },
    //       goalCell: [[0, 0]] as [number, number][],
    //       maxX: 7,
    //       maxY: 7,
    //     };
    //     const roomSession = createMockRoomSession([{ id: 1 }]);

    //     expect(() => executeCommand(command, gridInfo, roomSession)).toThrow(
    //       NotFoundError
    //     );
    //     expect(() => executeCommand(command, gridInfo, roomSession)).toThrow(
    //       "Role not found"
    //     );
    //   });
    // });
  });

  describe("getAvailableCommandsByRole", () => {
    const mockRole: TRole = {
      roleId: 1,
      roleName: "EMPEROR",
      priority: 1,
      description: "Test role",
      imageUrl: "",
      notionUrl: "",
      group: 1,
    };

    const mockMe: TRoomMember = {
      id: 1,
      roomId: 1,
      userId: "user1",
      roleId: 1,
      status: 0,
      joinedAt: new Date(),
      role: mockRole,
    };

    const mockMembers: TRoomMember[] = [
      mockMe,
      {
        id: 2,
        roomId: 1,
        userId: "user2",
        roleId: 2,
        status: 0,
        joinedAt: new Date(),
        role: {
          roleId: 2,
          roleName: "DEATH",
          priority: 2,
          description: "Test role 2",
          imageUrl: "",
          notionUrl: "",
          group: 2,
        },
      },
    ];

    const mockGameSetting = {
      roleSetting: {
        EMPEROR: {
          availableCommands: [
            "SPECIAL",
            "SKIP",
            "FORWARD",
            "TURN_RIGHT",
          ] as TCommandType[],
        },
      },
    };

    beforeEach(() => {
      (jsonRW.readJson as jest.Mock).mockResolvedValue(mockGameSetting);
    });

    it("ロールIDに応じた利用可能なコマンドを返す", async () => {
      const meta = {
        formId: "form-123",
        roomSessionId: 1,
        memberId: 1,
        turn: 1,
      };

      const result = await getAvailableCommandsByRole(
        mockRole,
        "submitCommand",
        meta,
        mockMembers,
        mockMe
      );

      expect(result).toHaveLength(4);
      expect(result[0]).toMatchObject({
        commandType: "SPECIAL",
        displayText: COMMAND_BUTTON_DATA_MAP.SPECIAL.displayText,
        label: COMMAND_BUTTON_DATA_MAP.SPECIAL.label,
        formId: meta.formId,
        action: "submitCommand",
        roomSessionId: meta.roomSessionId,
        memberId: meta.memberId,
        turn: meta.turn,
        arg: "",
      });

      // ゲーム設定ファイルから正しいコマンドタイプを取得していることを確認
      expect(jsonRW.readJson).toHaveBeenCalled();
      const callArgs = (jsonRW.readJson as jest.Mock).mock.calls[0][0];
      expect(callArgs).toContain("game-setting.json");
    });

    it("全てのコマンドタイプが正しい形式で返される", async () => {
      const meta = {
        formId: "form-123",
        roomSessionId: 1,
        memberId: 1,
        turn: 1,
      };

      const result = await getAvailableCommandsByRole(
        mockRole,
        "submitCommand",
        meta,
        mockMembers,
        mockMe
      );

      result.forEach((command) => {
        expect(command).toHaveProperty("commandType");
        expect(command).toHaveProperty("displayText");
        expect(command).toHaveProperty("label");
        expect(command).toHaveProperty("formId");
        expect(command).toHaveProperty("action");
        expect(command).toHaveProperty("roomSessionId");
        expect(command).toHaveProperty("memberId");
        expect(command).toHaveProperty("turn");
        expect(command).toHaveProperty("arg");
      });
    });
  });

  describe("gameUtil exported functions", () => {
    it("createGameSetting が正しい設定を返す", () => {
      const size = 5;
      const initialCell: [number, number] = [2, 2];
      const initialDirection: TDirection = "E";
      const specialCells: [number, number][] = [
        [1, 1],
        [3, 3],
      ];

      const result = gameUtil.createGameSetting(
        size,
        initialCell,
        initialDirection,
        specialCells
      );

      expect(result.size).toBe(size);
      expect(result.initialCell).toEqual(initialCell);
      expect(result.initialDirection).toBe(initialDirection);
      expect(result.specialCells).toEqual(specialCells);
      expect(result.goalCell).toHaveLength(2);
    });

    it("createGameSetting がデフォルト値を使用する", () => {
      const result = gameUtil.createGameSetting();

      expect(result.size).toBe(DEFAULT_SETTING.size);
      expect(result.initialCell).toEqual(DEFAULT_SETTING.initialCell);
      expect(result.initialDirection).toBe(DEFAULT_SETTING.initialDirection);
      expect(result.specialCells).toHaveLength(2);
      expect(result.goalCell).toHaveLength(2);
    });

    it("getRoomSettingJsonContents が正しくJSONをパースする", () => {
      const jsonString = JSON.stringify({
        size: 7,
        initialCell: [3, 3],
        initialDirection: "N",
        specialCells: [
          [2, 3],
          [4, 1],
        ],
        goalCell: [0, 0],
      });

      const result = gameUtil.getRoomSettingJsonContents(jsonString);

      expect(result.size).toBe(7);
      expect(result.initialCell).toEqual([3, 3]);
      expect(result.initialDirection).toBe("N");
      expect(result.specialCells).toEqual([
        [2, 3],
        [4, 1],
      ]);
      expect(result.goalCell).toEqual([0, 0]);
    });
  });
});
