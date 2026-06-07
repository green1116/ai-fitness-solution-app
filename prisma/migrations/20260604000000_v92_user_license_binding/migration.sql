-- V9.2-RC2: align schema with application (User, LicenseBinding, UpgradeOrder extensions)
-- Run: npx prisma migrate deploy (staging/production)

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "LicenseBinding" (
    "userId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseBinding_pkey" PRIMARY KEY ("userId","licenseId")
);

CREATE INDEX IF NOT EXISTS "LicenseBinding_userId_idx" ON "LicenseBinding"("userId");
CREATE INDEX IF NOT EXISTS "LicenseBinding_licenseId_idx" ON "LicenseBinding"("licenseId");

DO $$ BEGIN
  ALTER TABLE "LicenseBinding" ADD CONSTRAINT "LicenseBinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "LicenseBinding" ADD CONSTRAINT "LicenseBinding_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "LicenseKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "session" ADD COLUMN IF NOT EXISTS "userId" TEXT;

ALTER TABLE "upgrade_order" ADD COLUMN IF NOT EXISTS "projectId" TEXT;
ALTER TABLE "upgrade_order" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "upgrade_order" ADD COLUMN IF NOT EXISTS "clientFingerprint" TEXT;
ALTER TABLE "upgrade_order" ADD COLUMN IF NOT EXISTS "paymentProvider" TEXT;
