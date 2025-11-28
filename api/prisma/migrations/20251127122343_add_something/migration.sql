/*
  Warnings:

  - The values [RIGHT] on the enum `Command_commandType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Command` MODIFY `commandType` ENUM('FORWARD', 'TURN_RIGHT') NOT NULL;
