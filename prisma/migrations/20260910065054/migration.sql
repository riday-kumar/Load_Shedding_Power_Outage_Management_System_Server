/*
  Warnings:

  - A unique constraint covering the columns `[distributor_id,allocatedAt]` on the table `power_distributors` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "power_distributors" ALTER COLUMN "allocatedAt" DROP DEFAULT,
ALTER COLUMN "allocatedAt" SET DATA TYPE DATE;

-- CreateIndex
CREATE UNIQUE INDEX "power_distributors_distributor_id_allocatedAt_key" ON "power_distributors"("distributor_id", "allocatedAt");
