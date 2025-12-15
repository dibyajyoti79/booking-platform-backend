/*
  Warnings:

  - You are about to drop the column `hotelId` on the `booking` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `booking` table. All the data in the column will be lost.
  - Added the required column `hotel_id` to the `Booking` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `booking` DROP COLUMN `hotelId`,
    DROP COLUMN `userId`,
    ADD COLUMN `hotel_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL;
