/*
  Warnings:

  - You are about to drop the column `index` on the `ProofList` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[code]` on the table `ProofList` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `ProofList` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `ProofList_index_key` ON `ProofList`;

-- AlterTable
ALTER TABLE `ProofList` DROP COLUMN `index`,
    ADD COLUMN `code` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `ProofList_code_key` ON `ProofList`(`code`);
