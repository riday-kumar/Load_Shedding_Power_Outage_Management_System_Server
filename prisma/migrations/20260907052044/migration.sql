/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'CREDENTIAL');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCK');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'POWER_AUTH', 'DISTRIBUTOR_MANAGER', 'POWER_OPERATOR', 'TECHNICIAN', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "TechnicianStatus" AS ENUM ('AVAILABLE', 'ENGAGED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "EmergencyOutageStatus" AS ENUM ('Reported', 'Verified', 'TECHNICIAN_ASSIGNED', 'UNDER_REPAIR', 'Resolved');

-- CreateEnum
CREATE TYPE "LoadSheddingStatus" AS ENUM ('Draft', 'Pending', 'Approved', 'Published', 'Rejected', 'Completed');

-- CreateEnum
CREATE TYPE "TechnicianAssignmentStatus" AS ENUM ('Accepted', 'Rejected', 'Traveling', 'On_Site', 'InProgress', 'Cancelled', 'Completed');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "distributors" (
    "id" TEXT NOT NULL,
    "company_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "distributorManagers" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,

    CONSTRAINT "distributorManagers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_outages" (
    "id" TEXT NOT NULL,
    "feeder_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "startedAt" TEXT,
    "resolvedAt" TEXT,
    "status" "EmergencyOutageStatus" NOT NULL DEFAULT 'Reported',
    "damage" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_outages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeders" (
    "id" TEXT NOT NULL,
    "feeder_name" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "substation_id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feeders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loadSheddingSchedules" (
    "id" TEXT NOT NULL,
    "feeder_id" TEXT NOT NULL,
    "powerOperator_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "start_time" TEXT NOT NULL,
    "end_time" TEXT NOT NULL,
    "reason" TEXT,
    "status" "LoadSheddingStatus" NOT NULL DEFAULT 'Draft',
    "plannedLoadShedding" DECIMAL(65,30) NOT NULL,
    "approvedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loadSheddingSchedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nationalPowerStatus" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "generatedPowerMW" DECIMAL(65,30) NOT NULL,
    "demand" DECIMAL(65,30) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nationalPowerStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "power_distributors" (
    "id" TEXT NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expected_need" DECIMAL(65,30) NOT NULL,
    "allocated" DECIMAL(65,30) NOT NULL,
    "distributor_id" TEXT NOT NULL,

    CONSTRAINT "power_distributors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "powerOperators" (
    "id" TEXT NOT NULL,
    "substation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "powerOperators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substations" (
    "id" TEXT NOT NULL,
    "station_name" TEXT NOT NULL,
    "distributor_id" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "substations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "substationPowerAllocations" (
    "id" TEXT NOT NULL,
    "substation_id" TEXT NOT NULL,
    "allocationAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedNeed" DECIMAL(65,30) NOT NULL,
    "allocatedNeed" DECIMAL(65,30) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "powerDistributionId" TEXT,

    CONSTRAINT "substationPowerAllocations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicians" (
    "id" TEXT NOT NULL,
    "status" "TechnicianStatus" NOT NULL DEFAULT 'AVAILABLE',
    "skill" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "technicianAssignments" (
    "id" TEXT NOT NULL,
    "emergencyOutage_id" TEXT NOT NULL,
    "technician_id" TEXT NOT NULL,
    "assignedBy" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "acceptedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "status" "TechnicianAssignmentStatus",
    "rejectReason" TEXT,

    CONSTRAINT "technicianAssignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" VARCHAR(11),
    "address" TEXT,
    "password" TEXT,
    "googleId" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIAL',
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "imagePublicId" TEXT NOT NULL DEFAULT '',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "distributorManagers_user_id_key" ON "distributorManagers"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "powerOperators_user_id_key" ON "powerOperators"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_user_id_key" ON "technicians"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");

-- AddForeignKey
ALTER TABLE "distributorManagers" ADD CONSTRAINT "distributorManagers_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "distributorManagers" ADD CONSTRAINT "distributorManagers_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_outages" ADD CONSTRAINT "emergency_outages_feeder_id_fkey" FOREIGN KEY ("feeder_id") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_outages" ADD CONSTRAINT "emergency_outages_reporter_id_fkey" FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "feeders" ADD CONSTRAINT "feeders_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadSheddingSchedules" ADD CONSTRAINT "loadSheddingSchedules_feeder_id_fkey" FOREIGN KEY ("feeder_id") REFERENCES "feeders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadSheddingSchedules" ADD CONSTRAINT "loadSheddingSchedules_powerOperator_id_fkey" FOREIGN KEY ("powerOperator_id") REFERENCES "powerOperators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loadSheddingSchedules" ADD CONSTRAINT "loadSheddingSchedules_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "distributorManagers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nationalPowerStatus" ADD CONSTRAINT "nationalPowerStatus_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "power_distributors" ADD CONSTRAINT "power_distributors_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "powerOperators" ADD CONSTRAINT "powerOperators_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "powerOperators" ADD CONSTRAINT "powerOperators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_distributor_id_fkey" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substations" ADD CONSTRAINT "substations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substationPowerAllocations" ADD CONSTRAINT "substationPowerAllocations_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substationPowerAllocations" ADD CONSTRAINT "substationPowerAllocations_substation_id_fkey" FOREIGN KEY ("substation_id") REFERENCES "substations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "substationPowerAllocations" ADD CONSTRAINT "substationPowerAllocations_powerDistributionId_fkey" FOREIGN KEY ("powerDistributionId") REFERENCES "power_distributors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicians" ADD CONSTRAINT "technicians_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicianAssignments" ADD CONSTRAINT "technicianAssignments_emergencyOutage_id_fkey" FOREIGN KEY ("emergencyOutage_id") REFERENCES "emergency_outages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicianAssignments" ADD CONSTRAINT "technicianAssignments_technician_id_fkey" FOREIGN KEY ("technician_id") REFERENCES "technicians"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "technicianAssignments" ADD CONSTRAINT "technicianAssignments_assignedBy_fkey" FOREIGN KEY ("assignedBy") REFERENCES "powerOperators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
