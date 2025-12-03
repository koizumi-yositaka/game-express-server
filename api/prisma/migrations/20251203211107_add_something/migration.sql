/*
  Warnings:

  - You are about to drop the column `processed` on the `CommandHistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CommandHistory` DROP COLUMN `processed`,
    ADD COLUMN `arg` VARCHAR(191) NOT NULL DEFAULT '';
