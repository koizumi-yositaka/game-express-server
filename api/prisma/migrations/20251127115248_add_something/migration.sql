/*
  Warnings:

  - Made the column `description` on table `MRole` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `MRole` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `MRole` MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `imageUrl` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `RoomSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `turn` INTEGER NOT NULL DEFAULT 1,
    `posX` INTEGER NOT NULL,
    `posY` INTEGER NOT NULL,
    `direction` ENUM('N', 'E', 'S', 'W') NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Command` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomSessionId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `commandType` ENUM('FORWARD', 'RIGHT') NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomSession` ADD CONSTRAINT `RoomSession_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Room`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Command` ADD CONSTRAINT `Command_roomSessionId_fkey` FOREIGN KEY (`roomSessionId`) REFERENCES `RoomSession`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Command` ADD CONSTRAINT `Command_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `RoomMember`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
