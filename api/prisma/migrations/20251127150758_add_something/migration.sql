-- CreateTable
CREATE TABLE `CommandHistory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomSessionId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `turn` INTEGER NOT NULL,
    `processed` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
