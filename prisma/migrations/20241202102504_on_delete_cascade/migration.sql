-- DropForeignKey
ALTER TABLE `carts` DROP FOREIGN KEY `carts_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `carts` DROP FOREIGN KEY `carts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `checkout_details` DROP FOREIGN KEY `checkout_details_checkout_id_fkey`;

-- DropForeignKey
ALTER TABLE `checkouts` DROP FOREIGN KEY `checkouts_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `product_categories` DROP FOREIGN KEY `product_categories_category_id_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_merchant_id_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_product_id_fkey`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `reviews_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `product_categories` ADD CONSTRAINT `product_categories_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_merchant_id_fkey` FOREIGN KEY (`merchant_id`) REFERENCES `merchants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `carts` ADD CONSTRAINT `carts_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkouts` ADD CONSTRAINT `checkouts_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checkout_details` ADD CONSTRAINT `checkout_details_checkout_id_fkey` FOREIGN KEY (`checkout_id`) REFERENCES `checkouts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
