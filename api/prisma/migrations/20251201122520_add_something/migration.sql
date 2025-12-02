-- AlterTable
ALTER TABLE `Command` MODIFY `commandType` ENUM('FORWARD', 'TURN_RIGHT', 'TURN_LEFT') NOT NULL;
