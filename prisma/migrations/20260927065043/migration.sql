/*
  Warnings:

  - The `startedAt` column on the `emergency_outages` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `resolvedAt` column on the `emergency_outages` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "emergency_outages" DROP COLUMN "startedAt",
ADD COLUMN     "startedAt" TIMESTAMP(3),
DROP COLUMN "resolvedAt",
ADD COLUMN     "resolvedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "feeders" ADD COLUMN     "district" TEXT,
ADD COLUMN     "division" TEXT;

-- AlterTable
ALTER TABLE "loadSheddingSchedules" ALTER COLUMN "start_time" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "end_time" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "feederId" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_feederId_fkey" FOREIGN KEY ("feederId") REFERENCES "feeders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
