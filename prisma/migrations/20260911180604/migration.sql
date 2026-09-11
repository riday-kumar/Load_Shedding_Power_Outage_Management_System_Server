-- DropForeignKey
ALTER TABLE "loadSheddingSchedules" DROP CONSTRAINT "loadSheddingSchedules_approvedById_fkey";

-- AlterTable
ALTER TABLE "loadSheddingSchedules" ALTER COLUMN "date" DROP DEFAULT,
ALTER COLUMN "date" SET DATA TYPE DATE,
ALTER COLUMN "approvedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "loadSheddingSchedules" ADD CONSTRAINT "loadSheddingSchedules_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "distributorManagers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
