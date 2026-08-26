-- V61.1 Launch Blocker Resolution
-- Closes B1: Organization tenancy + Project/Quote organizationId integrity

-- CreateTable
CREATE TABLE "organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organization_member" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_member_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "organizationId" TEXT;

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'GENERATING', 'READY', 'FAILED');

-- CreateEnum
CREATE TYPE "TenderStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- AlterEnum
ALTER TYPE "DocumentType" ADD VALUE IF NOT EXISTS 'tender';

-- CreateTable
CREATE TABLE "quote" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "organizationId" TEXT,
    "workspaceId" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "companyInfo" JSONB,
    "content" JSONB,
    "orchestrationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "quoteId" TEXT,
    "budgetId" TEXT,
    "status" "TenderStatus" NOT NULL DEFAULT 'PENDING',
    "fileName" TEXT,
    "fileUrl" TEXT,
    "renderVersion" TEXT NOT NULL DEFAULT 'v59-1',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_organizationId_userId_key" ON "organization_member"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "organization_member_userId_idx" ON "organization_member"("userId");

-- CreateIndex
CREATE INDEX "Project_organizationId_idx" ON "Project"("organizationId");

-- CreateIndex
CREATE INDEX "quote_projectId_idx" ON "quote"("projectId");

-- CreateIndex
CREATE INDEX "quote_organizationId_idx" ON "quote"("organizationId");

-- CreateIndex
CREATE INDEX "quote_workspaceId_idx" ON "quote"("workspaceId");

-- CreateIndex
CREATE INDEX "tender_projectId_idx" ON "tender"("projectId");

-- CreateIndex
CREATE INDEX "tender_quoteId_idx" ON "tender"("quoteId");

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_member" ADD CONSTRAINT "organization_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote" ADD CONSTRAINT "quote_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender" ADD CONSTRAINT "tender_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender" ADD CONSTRAINT "tender_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "quote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender" ADD CONSTRAINT "tender_budgetId_fkey" FOREIGN KEY ("budgetId") REFERENCES "Budget"("id") ON DELETE SET NULL ON UPDATE CASCADE;
