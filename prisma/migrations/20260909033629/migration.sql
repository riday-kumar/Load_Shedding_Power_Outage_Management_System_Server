/*
  Warnings:

  - The values [Reported,Resolved] on the enum `EmergencyOutageStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Draft,Pending,Approved,Published,Rejected,Completed] on the enum `LoadSheddingStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [Accepted,Rejected,Traveling,On_Site,InProgress,Cancelled,Completed] on the enum `TechnicianAssignmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmergencyOutageStatus_new" AS ENUM ('REPORTED', 'Verified', 'TECHNICIAN_ASSIGNED', 'UNDER_REPAIR', 'RESOLVED');
ALTER TABLE "public"."emergency_outages" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "emergency_outages" ALTER COLUMN "status" TYPE "EmergencyOutageStatus_new" USING ("status"::text::"EmergencyOutageStatus_new");
ALTER TYPE "EmergencyOutageStatus" RENAME TO "EmergencyOutageStatus_old";
ALTER TYPE "EmergencyOutageStatus_new" RENAME TO "EmergencyOutageStatus";
DROP TYPE "public"."EmergencyOutageStatus_old";
ALTER TABLE "emergency_outages" ALTER COLUMN "status" SET DEFAULT 'REPORTED';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "LoadSheddingStatus_new" AS ENUM ('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED', 'COMPLETED');
ALTER TABLE "public"."loadSheddingSchedules" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "loadSheddingSchedules" ALTER COLUMN "status" TYPE "LoadSheddingStatus_new" USING ("status"::text::"LoadSheddingStatus_new");
ALTER TYPE "LoadSheddingStatus" RENAME TO "LoadSheddingStatus_old";
ALTER TYPE "LoadSheddingStatus_new" RENAME TO "LoadSheddingStatus";
DROP TYPE "public"."LoadSheddingStatus_old";
ALTER TABLE "loadSheddingSchedules" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "TechnicianAssignmentStatus_new" AS ENUM ('ACCEPTED', 'REJECTED', 'TRAVELING', 'ON_SITE', 'IN_PROGRESS', 'CANCELLED', 'COMPLETED', 'FAILED');
ALTER TABLE "technicianAssignments" ALTER COLUMN "status" TYPE "TechnicianAssignmentStatus_new" USING ("status"::text::"TechnicianAssignmentStatus_new");
ALTER TYPE "TechnicianAssignmentStatus" RENAME TO "TechnicianAssignmentStatus_old";
ALTER TYPE "TechnicianAssignmentStatus_new" RENAME TO "TechnicianAssignmentStatus";
DROP TYPE "public"."TechnicianAssignmentStatus_old";
COMMIT;

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'DELETED';

-- AlterTable
ALTER TABLE "emergency_outages" ALTER COLUMN "status" SET DEFAULT 'REPORTED';

-- AlterTable
ALTER TABLE "loadSheddingSchedules" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
