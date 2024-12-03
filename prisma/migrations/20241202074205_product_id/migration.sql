-- DropForeignKey
ALTER TABLE `product_categories` DROP FOREIGN KEY `product_categories_product_id_fkey`;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
