/*
  Warnings:

  - Added the required column `user_id` to the `histories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `histories` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `histories` ADD CONSTRAINT `histories_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
