-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

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

-- CreateTable
CREATE TABLE "planjob" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "input" JSONB,
    "plan" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',

    CONSTRAINT "planjob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailOtp" (
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailOtp_pkey" PRIMARY KEY ("email")
);

-- CreateTable
CREATE TABLE "session" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "email" TEXT,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseKey" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "planId" TEXT,
    "maxDownloads" INTEGER NOT NULL DEFAULT 0,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "requireLogin" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LicenseKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfDownloadLog" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "ip" TEXT,
    "ok" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "error" TEXT,
    "userAgent" TEXT,
    "route" TEXT NOT NULL DEFAULT '/api/pdf',
    "method" TEXT NOT NULL DEFAULT 'GET',
    "mode" TEXT,
    "level" TEXT,
    "format" TEXT,
    "theme" TEXT,
    "pdfVersion" TEXT,
    "planVersion" TEXT,
    "budgetVersion" TEXT,
    "reqsig" TEXT,
    "docSeq" TEXT,
    "pages" INTEGER,
    "bytes" INTEGER,
    "ua" TEXT,
    "extra" JSONB,

    CONSTRAINT "PdfDownloadLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseConsume" (
    "id" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseConsume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfDownloadTokenDeny" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "planId" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PdfDownloadTokenDeny_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PdfDownloadTokenState" (
    "id" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "mode" TEXT,
    "expAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PdfDownloadTokenState_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "EmailVerifyCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "planLevel" TEXT NOT NULL DEFAULT 'pro',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerifyCode_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "upgrade_order" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "upgrade_order_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_email_idx" ON "session"("email");

-- CreateIndex
CREATE INDEX "order_planId_idx" ON "order"("planId");

-- CreateIndex
CREATE INDEX "order_email_idx" ON "order"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseKey_keyHash_key" ON "LicenseKey"("keyHash");

-- CreateIndex
CREATE INDEX "PdfDownloadLog_planId_createdAt_idx" ON "PdfDownloadLog"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "PdfDownloadLog_createdAt_idx" ON "PdfDownloadLog"("createdAt");

-- CreateIndex
CREATE INDEX "LicenseConsume_planId_createdAt_idx" ON "LicenseConsume"("planId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "LicenseConsume_licenseId_fingerprint_key" ON "LicenseConsume"("licenseId", "fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "PdfDownloadTokenDeny_tokenHash_key" ON "PdfDownloadTokenDeny"("tokenHash");

-- CreateIndex
CREATE INDEX "PdfDownloadTokenDeny_planId_createdAt_idx" ON "PdfDownloadTokenDeny"("planId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PdfDownloadTokenState_tokenHash_key" ON "PdfDownloadTokenState"("tokenHash");

-- CreateIndex
CREATE INDEX "PdfDownloadTokenState_planId_createdAt_idx" ON "PdfDownloadTokenState"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "PdfDownloadTokenState_revoked_expAt_idx" ON "PdfDownloadTokenState"("revoked", "expAt");

-- CreateIndex
CREATE INDEX "Lead_email_createdAt_idx" ON "Lead"("email", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_planId_createdAt_idx" ON "Lead"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "EmailVerifyCode_email_mode_planId_planLevel_idx" ON "EmailVerifyCode"("email", "mode", "planId", "planLevel");

-- CreateIndex
CREATE INDEX "EmailVerifyCode_expiresAt_idx" ON "EmailVerifyCode"("expiresAt");

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
CREATE INDEX "upgrade_order_planId_createdAt_idx" ON "upgrade_order"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "upgrade_order_status_idx" ON "upgrade_order"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_projectId_key" ON "Solution"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "SkuMapping_placeholderId_key" ON "SkuMapping"("placeholderId");

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
