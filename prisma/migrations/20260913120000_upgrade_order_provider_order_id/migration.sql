-- AlterTable
ALTER TABLE "upgrade_order" ADD COLUMN "providerOrderId" TEXT;

-- CreateIndex
CREATE INDEX "upgrade_order_providerOrderId_idx" ON "upgrade_order"("providerOrderId");
