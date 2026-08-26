-- V65 P2 — Prisma preflight alignment
-- Schema contract restored in prisma/schema.prisma (reverts accidental V63 freeze drift).
-- Migration chain remains valid; no destructive DDL — idempotent guards only.

-- Organization.slug (V61.1 launch blocker baseline)
ALTER TABLE "organization" ADD COLUMN IF NOT EXISTS "slug" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "organization_slug_key" ON "organization"("slug");

-- SaasPlan / SaasSubStatus enums (V59 SaaS)
DO $$ BEGIN
  CREATE TYPE "SaasPlan" AS ENUM ('BASIC', 'PRO', 'ENTERPRISE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "SaasSubStatus" AS ENUM ('ACTIVE', 'CANCELED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- subscription table (@@map on Subscription model)
CREATE TABLE IF NOT EXISTS "subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" "SaasPlan" NOT NULL DEFAULT 'BASIC',
    "status" "SaasSubStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscription_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "subscription_organizationId_idx" ON "subscription"("organizationId");
CREATE INDEX IF NOT EXISTS "subscription_status_idx" ON "subscription"("status");
CREATE INDEX IF NOT EXISTS "subscription_stripeSubscriptionId_idx" ON "subscription"("stripeSubscriptionId");

DO $$ BEGIN
  ALTER TABLE "subscription"
    ADD CONSTRAINT "subscription_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- saas_invoice table (@@map on SaasInvoice model)
CREATE TABLE IF NOT EXISTS "saas_invoice" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "stripeInvoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saas_invoice_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "saas_invoice_organizationId_idx" ON "saas_invoice"("organizationId");

DO $$ BEGIN
  ALTER TABLE "saas_invoice"
    ADD CONSTRAINT "saas_invoice_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "saas_invoice"
    ADD CONSTRAINT "saas_invoice_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "subscription"("id")
    ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
