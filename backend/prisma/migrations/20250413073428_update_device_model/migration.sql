/*
  Warnings:

  - You are about to drop the column `deviceId` on the `Device` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,identifier]` on the table `Device` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `identifier` to the `Device` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Device` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('MOBILE', 'DESKTOP', 'WEB', 'OTHER');

-- DropIndex
DROP INDEX "Device_deviceId_key";

-- AlterTable
ALTER TABLE "Device" DROP COLUMN "deviceId",
ADD COLUMN     "identifier" TEXT NOT NULL,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "type" "DeviceType" NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Device_userId_identifier_key" ON "Device"("userId", "identifier");
