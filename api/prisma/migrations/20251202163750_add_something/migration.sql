/*
  Warnings:

  - A unique constraint covering the columns `[commandId]` on the table `CommandHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `CommandHistory_commandId_key` ON `CommandHistory`(`commandId`);

-- AddForeignKey
ALTER TABLE `CommandHistory` ADD CONSTRAINT `CommandHistory_commandId_fkey` FOREIGN KEY (`commandId`) REFERENCES `Command`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
