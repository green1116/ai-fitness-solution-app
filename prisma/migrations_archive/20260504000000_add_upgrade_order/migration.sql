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

-- CreateIndex
CREATE INDEX "upgrade_order_planId_createdAt_idx" ON "upgrade_order"("planId", "createdAt");

-- CreateIndex
CREATE INDEX "upgrade_order_status_idx" ON "upgrade_order"("status");
