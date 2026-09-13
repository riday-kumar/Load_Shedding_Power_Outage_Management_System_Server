-- AlterTable
ALTER TABLE "subscriptions" ALTER COLUMN "startedAt" DROP NOT NULL,
ALTER COLUMN "expiresAt" DROP NOT NULL;
