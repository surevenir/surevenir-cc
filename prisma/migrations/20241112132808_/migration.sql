/*
  Warnings:

  - You are about to alter the column `checkout_id` on the `carts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - The primary key for the `checkouts` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `checkouts` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to drop the column `profile_image_url` on the `merchants` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `carts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `checkouts` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `histories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `images` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `markets` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `merchants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `product_categories` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `products` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `reviews` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `carts` DROP FOREIGN KEY `carts_checkout_id_fkey`;

-- AlterTable
ALTER TABLE `carts` MODIFY `checkout_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `checkouts` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `merchants` DROP COLUMN `profile_image_url`;

-- CreateIndex
CREATE UNIQUE INDEX `carts_id_key` ON `carts`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `categories_id_key` ON `categories`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `categories_name_key` ON `categories`(`name`);

-- CreateIndex
CREATE UNIQUE INDEX `checkouts_id_key` ON `checkouts`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `histories_id_key` ON `histories`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `images_id_key` ON `images`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `markets_id_key` ON `markets`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `merchants_id_key` ON `merchants`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `product_categories_id_key` ON `product_categories`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `products_id_key` ON `products`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `reviews_id_key` ON `reviews`(`id`);

-- CreateIndex
CREATE UNIQUE INDEX `users_id_key` ON `users`(`id`);

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
