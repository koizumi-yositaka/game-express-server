import { roleSpecialMoveExecutor } from "./roleSpecialMoveExecutor";
import { ROLE_NAME_MAP } from "../domain/common";
import Emperor from "./imp/emperor";
import Death from "./imp/death";
import Hierophant from "./imp/hierophant";
import Sun from "./imp/sun";
import Moon from "./imp/moon";
import Fool from "./imp/fool";
import Tower from "./imp/tower";
import { TCommand, TRoomSession } from "../domain/types";
import { Prisma } from "../generated/prisma/client";

// ロールクラスのモック
jest.mock("./imp/emperor");
jest.mock("./imp/death");
jest.mock("./imp/hierophant");
jest.mock("./imp/sun");
jest.mock("./imp/moon");
jest.mock("./imp/fool");
jest.mock("./imp/tower");

describe("roleSpecialMoveExecutor", () => {
  let mockTx: Prisma.TransactionClient;
  let mockCommand: TCommand;
  let mockRoomSession: TRoomSession;

  beforeEach(() => {
    jest.clearAllMocks();
    // console.log のモック
    jest.spyOn(console, "log").mockImplementation(() => {});

    // モックオブジェクトの準備
    mockTx = {} as Prisma.TransactionClient;
    mockCommand = {
      roomSessionId: 1,
      memberId: 1,
      commandType: "SPECIAL",
      processed: false,
      arg: "",
    };
    mockRoomSession = {
      id: 1,
      roomId: 1,
      posX: 0,
      posY: 0,
      turn: 1,
      direction: "N",
      status: 0,
      setting: "{}",
      room: {
        id: 1,
        roomCode: "TEST",
        status: 0,
        openFlg: true,
        createdAt: new Date(),
        members: [],
      },
      commands: [],
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("executeSpecialMove", () => {
    it("EMPEROR ロールで Emperor クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Emperor as jest.MockedClass<typeof Emperor>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "EMPEROR",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Emperor).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("DEATH ロールで Death クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "DEATH",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("HIEROPHANT ロールで Hierophant クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Hierophant as jest.MockedClass<typeof Hierophant>).mockImplementation(
        () => {
          return {
            executeSpecialMove: mockExecuteSpecialMove,
          } as any;
        }
      );

      await roleSpecialMoveExecutor.executeSpecialMove(
        "HIEROPHANT",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Hierophant).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("FOOL ロールで Fool クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Fool as jest.MockedClass<typeof Fool>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "FOOL",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Fool).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("THE_TOWER ロールで Tower クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Tower as jest.MockedClass<typeof Tower>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "THE_TOWER",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Tower).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("SUN ロールで Sun クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Sun as jest.MockedClass<typeof Sun>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "SUN",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Sun).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("MOON ロールで Moon クラスの executeSpecialMove が呼ばれる", async () => {
      const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
      (Moon as jest.MockedClass<typeof Moon>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      await roleSpecialMoveExecutor.executeSpecialMove(
        "MOON",
        mockTx,
        mockCommand,
        mockRoomSession
      );

      expect(Moon).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
        mockTx,
        mockCommand,
        mockRoomSession
      );
    });

    it("全ての ROLE_NAME_MAP のキーが動作する", async () => {
      const roleNames = Object.keys(ROLE_NAME_MAP) as Array<
        keyof typeof ROLE_NAME_MAP
      >;

      const classMap: Record<
        keyof typeof ROLE_NAME_MAP,
        jest.MockedClass<any>
      > = {
        EMPEROR: Emperor,
        DEATH: Death,
        HIEROPHANT: Hierophant,
        FOOL: Fool,
        THE_TOWER: Tower,
        SUN: Sun,
        MOON: Moon,
      };

      for (const roleName of roleNames) {
        const mockExecuteSpecialMove = jest.fn().mockResolvedValue(undefined);
        const MockClass = classMap[roleName];
        (MockClass as jest.MockedClass<typeof MockClass>).mockImplementation(
          () => {
            return {
              executeSpecialMove: mockExecuteSpecialMove,
            } as any;
          }
        );

        await roleSpecialMoveExecutor.executeSpecialMove(
          roleName,
          mockTx,
          mockCommand,
          mockRoomSession
        );

        expect(MockClass).toHaveBeenCalledTimes(1);
        expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
        expect(mockExecuteSpecialMove).toHaveBeenCalledWith(
          mockTx,
          mockCommand,
          mockRoomSession
        );

        jest.clearAllMocks();
      }
    });
  });
});
