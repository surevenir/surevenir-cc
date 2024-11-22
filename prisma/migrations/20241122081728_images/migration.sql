/*
  Warnings:

  - You are about to drop the column `cart_id` on the `checkout_details` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `carts` MODIFY `is_checkout` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `checkout_details` DROP COLUMN `cart_id`;

-- AlterTable
ALTER TABLE `images` MODIFY `item_id` INTEGER NULL,
    MODIFY `url` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NULL;
