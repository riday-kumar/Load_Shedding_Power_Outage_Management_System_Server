/*
  Warnings:

  - Added the required column `substationId` to the `technicians` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "technicians" ADD COLUMN     "substationId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_substationId_fkey" FOREIGN KEY ("substationId") REFERENCES "substations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
