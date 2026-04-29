/*
  Warnings:

  - You are about to drop the column `userId` on the `photos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[profileId,isPrimary]` on the table `photos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `profileId` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_userId_fkey";

-- DropIndex
DROP INDEX "photos_userId_idx";

-- DropIndex
DROP INDEX "photos_userId_isPrimary_key";

-- DropIndex
DROP INDEX "profiles_gender_idx";

-- DropIndex
DROP INDEX "profiles_seeking_idx";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "userId",
ADD COLUMN     "profileId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "photos_profileId_idx" ON "photos"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "photos_profileId_isPrimary_key" ON "photos"("profileId", "isPrimary");

-- CreateIndex
CREATE INDEX "profiles_age_idx" ON "profiles"("age");

-- CreateIndex
CREATE INDEX "profiles_gender_seeking_idx" ON "profiles"("gender", "seeking");

-- CreateIndex
CREATE INDEX "profiles_latitude_longitude_idx" ON "profiles"("latitude", "longitude");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
