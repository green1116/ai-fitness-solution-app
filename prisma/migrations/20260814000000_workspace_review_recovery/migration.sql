-- CreateTable
CREATE TABLE "workspace_review_recovery" (
    "id" TEXT NOT NULL,
    "surfaceItemId" TEXT NOT NULL,
    "recoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_review_recovery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workspace_review_recovery_surfaceItemId_key" ON "workspace_review_recovery"("surfaceItemId");
