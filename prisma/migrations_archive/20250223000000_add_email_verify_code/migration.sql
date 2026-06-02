-- CreateTable
CREATE TABLE "EmailVerifyCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerifyCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailVerifyCode_email_mode_planId_idx" ON "EmailVerifyCode"("email", "mode", "planId");

-- CreateIndex
CREATE INDEX "EmailVerifyCode_expiresAt_idx" ON "EmailVerifyCode"("expiresAt");
