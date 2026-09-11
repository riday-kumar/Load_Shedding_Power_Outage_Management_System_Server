/*
  Warnings:

  - Added the required column `createdBy` to the `technicians` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "technicians" ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "distributorManagers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
