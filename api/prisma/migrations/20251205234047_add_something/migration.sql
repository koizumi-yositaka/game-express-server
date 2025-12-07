-- CreateTable
CREATE TABLE `ProofList` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `index` INTEGER NOT NULL,
    `rank` VARCHAR(191) NOT NULL,
    `status` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ProofList_index_key`(`index`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
