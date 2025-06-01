/*
  Warnings:

  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Order" DROP COLUMN "paymentMethod",
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
