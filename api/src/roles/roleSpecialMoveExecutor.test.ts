import { roleSpecialMoveExecutor } from "./roleSpecialMoveExecutor";
import { ROLE_NAME_MAP } from "../domain/common";
import Emperor from "./imp/emperor";
import Death from "./imp/death";

// ロールクラスのモック
jest.mock("./imp/emperor");
jest.mock("./imp/death");

describe("roleSpecialMoveExecutor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // console.log のモック
    jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("executeSpecialMove", () => {
    it("EMPEROR ロールで Emperor クラスの executeSpecialMove が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Emperor as jest.MockedClass<typeof Emperor>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("EMPEROR");

      expect(Emperor).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("DEATH ロールで Death クラスの executeSpecialMove が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("DEATH");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("HIEROPHANT ロールで Death クラスの executeTurn が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("HIEROPHANT");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("FOOL ロールで Death クラスの executeTurn が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("FOOL");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("HIGH_PRIESTESS ロールで Death クラスの executeTurn が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("HIGH_PRIESTESS");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("HERMIT ロールで Death クラスの executeTurn が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("HERMIT");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("THE_TOWER ロールで Death クラスの executeTurn が呼ばれる", () => {
      const mockExecuteSpecialMove = jest.fn();
      (Death as jest.MockedClass<typeof Death>).mockImplementation(() => {
        return {
          executeSpecialMove: mockExecuteSpecialMove,
        } as any;
      });

      roleSpecialMoveExecutor.executeSpecialMove("THE_TOWER");

      expect(Death).toHaveBeenCalledTimes(1);
      expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);
    });

    it("全ての ROLE_NAME_MAP のキーが動作する", () => {
      const roleNames = Object.keys(ROLE_NAME_MAP) as Array<
        keyof typeof ROLE_NAME_MAP
      >;

      roleNames.forEach((roleName) => {
        const mockExecuteSpecialMove = jest.fn();
        const MockClass = roleName === "EMPEROR" ? Emperor : Death;
        (MockClass as jest.MockedClass<typeof MockClass>).mockImplementation(
          () => {
            return {
              executeSpecialMove: mockExecuteSpecialMove,
            } as any;
          }
        );

        roleSpecialMoveExecutor.executeSpecialMove(roleName);

        expect(MockClass).toHaveBeenCalledTimes(1);
        expect(mockExecuteSpecialMove).toHaveBeenCalledTimes(1);

        jest.clearAllMocks();
      });
    });
  });
});
