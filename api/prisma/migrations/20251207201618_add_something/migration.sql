-- AlterTable
ALTER TABLE `ProofList` MODIFY `revealedBy` VARCHAR(191) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE `ProofRoomSession` ADD COLUMN `focusOn` INTEGER NOT NULL DEFAULT 0;
