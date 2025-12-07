/*
  Warnings:

  - A unique constraint covering the columns `[roomSessionId]` on the table `ProofList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `roomSessionId` to the `ProofList` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `ProofList` ADD COLUMN `roomSessionId` INTEGER NOT NULL,
    MODIFY `rank` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX `ProofList_roomSessionId_key` ON `ProofList`(`roomSessionId`);
