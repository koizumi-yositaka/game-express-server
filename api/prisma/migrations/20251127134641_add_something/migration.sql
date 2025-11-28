/*
  Warnings:

  - A unique constraint covering the columns `[roomId]` on the table `RoomSession` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RoomSession_roomId_key` ON `RoomSession`(`roomId`);
