-- V59 SaaS — Idempotent table patch (not a Prisma migration)
-- Applies missing billing / usage tables required by schema.prisma.
-- Safe to run multiple times. Preserves existing data.
-- Prerequisite: "organization" table (v61_1 launch blocker migration).

-- ---------------------------------------------------------------------------
-- Enum: UsageType (for usage_record.type)
-- ---------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE "UsageType" AS ENUM ('QUOTE', 'BUDGET', 'TENDER', 'PDF');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Subscription (model Subscription — default table name, no @@map)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'BASIC',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "Subscription"
    ADD CONSTRAINT "Subscription_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- Payment (@@map "payment")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "payment" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "stripeSessionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'usd',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_stripeSessionId_key" ON "payment"("stripeSessionId");
CREATE INDEX IF NOT EXISTS "payment_organizationId_idx" ON "payment"("organizationId");

DO $$ BEGIN
  ALTER TABLE "payment"
    ADD CONSTRAINT "payment_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- StripeWebhookEvent (@@map "stripe_webhook_event")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "stripe_webhook_event" (
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_event_pkey" PRIMARY KEY ("stripeEventId")
);

-- ---------------------------------------------------------------------------
-- UsageRecord (@@map "usage_record")
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "usage_record" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "UsageType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_record_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "usage_record_organizationId_type_createdAt_idx"
  ON "usage_record"("organizationId", "type", "createdAt");

DO $$ BEGIN
  ALTER TABLE "usage_record"
    ADD CONSTRAINT "usage_record_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "organization"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- SaasInvoice (model SaasInvoice — default table name, no @@map)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "SaasInvoice" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER,
    "currency" TEXT DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SaasInvoice_pkey" PRIMARY KEY ("id")
);

DO $$ BEGIN
  ALTER TABLE "SaasInvoice"
    ADD CONSTRAINT "SaasInvoice_subscriptionId_fkey"
    FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
