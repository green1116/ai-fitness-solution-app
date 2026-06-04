-- AlterTable
ALTER TABLE "session" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "upgrade_order" ADD COLUMN     "clientFingerprint" TEXT,
ADD COLUMN     "paymentProvider" TEXT,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "userId" TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LicenseBinding" (
    "userId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LicenseBinding_pkey" PRIMARY KEY ("userId","licenseId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "LicenseBinding_userId_idx" ON "LicenseBinding"("userId");

-- CreateIndex
CREATE INDEX "LicenseBinding_licenseId_idx" ON "LicenseBinding"("licenseId");

-- AddForeignKey
ALTER TABLE "LicenseBinding" ADD CONSTRAINT "LicenseBinding_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LicenseBinding" ADD CONSTRAINT "LicenseBinding_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "LicenseKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;
