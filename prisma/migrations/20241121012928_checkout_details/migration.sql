/*
  Warnings:

  - You are about to drop the column `checkout_id` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `merchant_id` on the `checkouts` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `carts` DROP FOREIGN KEY `carts_checkout_id_fkey`;

-- AlterTable
ALTER TABLE `carts` DROP COLUMN `checkout_id`;

-- AlterTable
ALTER TABLE `checkouts` DROP COLUMN `merchant_id`;

-- CreateTable
CREATE TABLE `checkout_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `checkout_id` INTEGER NOT NULL,
    `product_id` INTEGER NOT NULL,
    `total_price` DOUBLE NOT NULL,
    `cart_id` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `checkout_details_id_key`(`id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `checkout_details` ADD CONSTRAINT `checkout_details_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout_details` ADD CONSTRAINT `checkout_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
