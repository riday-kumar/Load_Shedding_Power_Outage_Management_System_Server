/*
  Warnings:

  - Added the required column `createdBy` to the `feeders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "feeders" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "substationPowerAllocations" ALTER COLUMN "allocationAt" DROP DEFAULT,
ALTER COLUMN "allocationAt" SET DATA TYPE DATE;

-- AddForeignKey
ALTER TABLE "feeders" ADD CONSTRAINT "feeders_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "distributorManagers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
