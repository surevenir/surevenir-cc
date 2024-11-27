-- DropForeignKey
ALTER TABLE `merchants` DROP FOREIGN KEY `merchants_market_id_fkey`;

-- DropForeignKey
ALTER TABLE `merchants` DROP FOREIGN KEY `merchants_user_id_fkey`;

-- AlterTable
ALTER TABLE `merchants` MODIFY `market_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `merchants` ADD CONSTRAINT `merchants_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `merchants` ADD CONSTRAINT `merchants_market_id_fkey` FOREIGN KEY (`market_id`) REFERENCES `markets`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
