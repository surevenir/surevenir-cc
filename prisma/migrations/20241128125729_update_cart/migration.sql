/*
  Warnings:

  - You are about to drop the column `is_checkout` on the `carts` table. All the data in the column will be lost.
  - You are about to drop the column `total_price` on the `carts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `carts` DROP COLUMN `is_checkout`,
    DROP COLUMN `total_price`;
