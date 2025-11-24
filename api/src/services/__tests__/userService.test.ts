import { userService } from "../userService";
import { userRepository } from "../../repos/userRepository";

// userRepositoryをモック化
jest.mock("../../repos/userRepository", () => ({
  userRepository: {
    getUsers: jest.fn(),
  },
}));

const mockedUserRepository = userRepository as jest.Mocked<
  typeof userRepository
>;

describe("userService", () => {
  beforeEach(() => {
    // 各テストの前にモックをリセット
    jest.clearAllMocks();
  });

  describe("getUsers", () => {
    it("should return users from repository", async () => {
      // Arrange
      const mockUsers = { message: "users" };
      mockedUserRepository.getUsers.mockResolvedValue(mockUsers);

      // Act
      const result = await userService.getUsers();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(mockedUserRepository.getUsers).toHaveBeenCalledTimes(1);
      expect(mockedUserRepository.getUsers).toHaveBeenCalledWith();
    });

    it("should handle errors from repository", async () => {
      // Arrange
      const mockError = new Error("Database connection failed");
      mockedUserRepository.getUsers.mockRejectedValue(mockError);

      // Act & Assert
      await expect(userService.getUsers()).rejects.toThrow(
        "Database connection failed"
      );
      expect(mockedUserRepository.getUsers).toHaveBeenCalledTimes(1);
    });

    it("should return empty result when repository returns empty", async () => {
      // Arrange
      const mockEmptyResult = { message: "" };
      mockedUserRepository.getUsers.mockResolvedValue(mockEmptyResult);

      // Act
      const result = await userService.getUsers();

      // Assert
      expect(result).toEqual(mockEmptyResult);
      expect(mockedUserRepository.getUsers).toHaveBeenCalledTimes(1);
    });
  });
});
