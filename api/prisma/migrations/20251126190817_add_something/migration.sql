/*
  Warnings:

  - You are about to drop the column `role` on the `RoomMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RoomMember` DROP COLUMN `role`,
    ADD COLUMN `roleId` INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `MRole` (
    `roleId` INTEGER NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `imageUrl` VARCHAR(191) NULL,

    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoomMember` ADD CONSTRAINT `RoomMember_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `MRole`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;
