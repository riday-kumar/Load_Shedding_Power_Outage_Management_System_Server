/*
  Warnings:

  - Added the required column `createdById` to the `powerOperators` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "powerOperators" ADD COLUMN     "createdById" TEXT NOT NULL;
