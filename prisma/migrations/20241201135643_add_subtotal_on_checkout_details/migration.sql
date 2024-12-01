/*
  Warnings:

  - Added the required column `product_subtotal` to the `checkout_details` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `checkout_details` ADD COLUMN `product_subtotal` DOUBLE NOT NULL;
