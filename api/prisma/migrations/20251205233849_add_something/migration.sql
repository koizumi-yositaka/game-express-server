-- CreateTable
CREATE TABLE `ProofRoom` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomCode` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `openFlg` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProofRoom_roomCode_key`(`roomCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProofRoomMember` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` INTEGER NOT NULL DEFAULT 0,
    `status` INTEGER NOT NULL DEFAULT 0,
    `sort` INTEGER NOT NULL DEFAULT 0,
    `joinedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ProofRoomMember_roomId_userId_key`(`roomId`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProofRoomSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `turn` INTEGER NOT NULL DEFAULT 0,
    `setting` VARCHAR(191) NOT NULL DEFAULT '',
    `status` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProofRoomSession_roomId_key`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MProofRole` (
    `roleId` INTEGER NOT NULL,
    `roleName` VARCHAR(191) NOT NULL,
    `priority` INTEGER NOT NULL DEFAULT 0,
    `description` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `notionUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `group` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`roleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `ProofRoomMember` ADD CONSTRAINT `ProofRoomMember_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `ProofRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProofRoomMember` ADD CONSTRAINT `ProofRoomMember_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProofRoomMember` ADD CONSTRAINT `ProofRoomMember_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `MProofRole`(`roleId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProofRoomSession` ADD CONSTRAINT `ProofRoomSession_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `ProofRoom`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
