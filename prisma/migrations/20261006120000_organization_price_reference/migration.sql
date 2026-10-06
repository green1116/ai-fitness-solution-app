-- C.6-A — organization estimate price reference (additive only, no backfill)

CREATE TABLE "organization_price_reference" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subcategoryKey" TEXT NOT NULL,
    "budgetTier" "PriceBand" NOT NULL,
    "unitPriceMin" INTEGER NOT NULL,
    "unitPriceMax" INTEGER NOT NULL,
    "sourceNote" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organization_price_reference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "organization_price_reference_organizationId_subcategoryKey__key" ON "organization_price_reference"("organizationId", "subcategoryKey", "budgetTier");

ALTER TABLE "organization_price_reference" ADD CONSTRAINT "organization_price_reference_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
