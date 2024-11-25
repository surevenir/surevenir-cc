-- AlterTable
ALTER TABLE `images` MODIFY `url` TEXT NULL;

-- AlterTable
ALTER TABLE `merchants` ADD COLUMN `profile_image_url` VARCHAR(191) NULL;
