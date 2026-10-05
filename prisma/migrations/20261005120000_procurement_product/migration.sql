-- C.5-A — organization-scoped procurement product master data (additive only)

CREATE TABLE "procurement_product" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "identityKey" TEXT NOT NULL,
    "keySpecs" JSONB NOT NULL DEFAULT '[]',
    "priceFact" JSONB,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_product_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "procurement_product_organizationId_active_category_idx" ON "procurement_product"("organizationId", "active", "category");

CREATE INDEX "procurement_product_organizationId_identityKey_idx" ON "procurement_product"("organizationId", "identityKey");

ALTER TABLE "procurement_product" ADD CONSTRAINT "procurement_product_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
