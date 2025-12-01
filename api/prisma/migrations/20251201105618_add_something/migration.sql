/*
  Warnings:

  - A unique constraint covering the columns `[roomSessionId]` on the table `RoomSessionSetting` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RoomSessionSetting_roomSessionId_key` ON `RoomSessionSetting`(`roomSessionId`);
