-- CreateEnum
CREATE TYPE "SiteType" AS ENUM ('office', 'factory', 'park', 'school', 'hospital', 'mixed');

-- CreateEnum
CREATE TYPE "BudgetLevel" AS ENUM ('low', 'mid', 'high', 'custom');

-- CreateEnum
CREATE TYPE "DeliveryMode" AS ENUM ('standard', 'enterprise', 'tender');

-- CreateEnum
CREATE TYPE "PriceBand" AS ENUM ('low', 'mid', 'high');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('plan', 'budget', 'merged', 'zip');

-- DropIndex
DROP INDEX "EmailVerifyCode_email_mode_planId_idx";

-- AlterTable
ALTER TABLE "EmailVerifyCode" ADD COLUMN     "planLevel" TEXT NOT NULL DEFAULT 'pro';

-- AlterTable
ALTER TABLE "PdfDownloadLog" ADD COLUMN     "budgetVersion" TEXT,
ADD COLUMN     "bytes" INTEGER,
ADD COLUMN     "docSeq" TEXT,
ADD COLUMN     "extra" JSONB,
ADD COLUMN     "format" TEXT,
ADD COLUMN     "level" TEXT,
ADD COLUMN     "method" TEXT NOT NULL DEFAULT 'GET',
ADD COLUMN     "mode" TEXT,
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "pdfVersion" TEXT,
ADD COLUMN     "planVersion" TEXT,
ADD COLUMN     "reqsig" TEXT,
ADD COLUMN     "route" TEXT NOT NULL DEFAULT '/api/pdf',
ADD COLUMN     "theme" TEXT,
ADD COLUMN     "ua" TEXT;

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "company" TEXT,
    "name" TEXT,
    "title" TEXT,
    "planId" TEXT,
    "intent" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'download',
    "status" TEXT NOT NULL DEFAULT 'new',
    "score" INTEGER NOT NULL DEFAULT 0,
    "note" TEXT,
    "payload" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DownloadLead" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "downloadedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DownloadLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnlockIntent" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT,
    "ua" TEXT,

    CONSTRAINT "UnlockIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT,
    "industry" TEXT,
    "siteType" "SiteType" NOT NULL,
    "areaM2" DOUBLE PRECISION,
    "targetUsers" INTEGER,
    "city" TEXT,
    "budgetLevel" "BudgetLevel" NOT NULL,
    "deliveryMode" "DeliveryMode" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "background" TEXT NOT NULL,
    "requirements" JSONB NOT NULL,
    "objectives" JSONB NOT NULL,
    "zoning" JSONB NOT NULL,
    "implementationPlan" JSONB NOT NULL,
    "operationsPlan" JSONB NOT NULL,
    "riskControl" JSONB NOT NULL,
    "acceptanceCriteria" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductPlaceholder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subCategory" TEXT,
    "specTags" JSONB NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceBand" "PriceBand" NOT NULL,
    "recommendationReason" TEXT NOT NULL,
    "replaceable" BOOLEAN NOT NULL DEFAULT true,
    "skuId" TEXT,
    "skuName" TEXT,
    "brand" TEXT,
    "model" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductPlaceholder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Budget" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'CNY',
    "totalEstimateMin" DOUBLE PRECISION NOT NULL,
    "totalEstimateMax" DOUBLE PRECISION NOT NULL,
    "items" JSONB NOT NULL,
    "assumptions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Budget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentExport" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT,
    "renderVersion" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentExport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SkuMapping" (
    "id" TEXT NOT NULL,
    "placeholderId" TEXT NOT NULL,
    "skuId" TEXT NOT NULL,
    "skuName" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "imageUrl" TEXT,
    "unitPrice" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SkuMapping_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_email_createdAt_idx" ON "Lead"("email", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_planId_createdAt_idx" ON "Lead"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "DownloadLead_email_idx" ON "DownloadLead"("email");

-- CreateIndex
CREATE INDEX "DownloadLead_planId_idx" ON "DownloadLead"("planId");

-- CreateIndex
CREATE INDEX "DownloadLead_mode_idx" ON "DownloadLead"("mode");

-- CreateIndex
CREATE INDEX "UnlockIntent_planId_idx" ON "UnlockIntent"("planId");

-- CreateIndex
CREATE INDEX "UnlockIntent_createdAt_idx" ON "UnlockIntent"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_projectId_key" ON "Solution"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SkuMapping_placeholderId_key" ON "SkuMapping"("placeholderId");

-- CreateIndex
CREATE INDEX "EmailVerifyCode_email_mode_planId_planLevel_idx" ON "EmailVerifyCode"("email", "mode", "planId", "planLevel");

-- AddForeignKey
ALTER TABLE "Solution" ADD CONSTRAINT "Solution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductPlaceholder" ADD CONSTRAINT "ProductPlaceholder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Budget" ADD CONSTRAINT "Budget_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentExport" ADD CONSTRAINT "DocumentExport_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkuMapping" ADD CONSTRAINT "SkuMapping_placeholderId_fkey" FOREIGN KEY ("placeholderId") REFERENCES "ProductPlaceholder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
