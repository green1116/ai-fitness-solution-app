-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

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

