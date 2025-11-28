/*
  Warnings:

  - Added the required column `commandId` to the `CommandHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CommandHistory` ADD COLUMN `commandId` INTEGER NOT NULL;
