-- CreateEnum
CREATE TYPE "UsageType" AS ENUM ('QUOTE', 'BUDGET', 'TENDER', 'PDF');

-- DropIndex
DROP INDEX "Project_organizationId_idx";

-- CreateTable
CREATE TABLE "payment" (
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

-- CreateTable
CREATE TABLE "stripe_webhook_event" (
    "stripeEventId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "processedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stripe_webhook_event_pkey" PRIMARY KEY ("stripeEventId")
);

-- CreateTable
CREATE TABLE "usage_record" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "UsageType" NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usage_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_customer" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_lead" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'unknown',
    "score" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_opportunity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "leadId" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'INIT',
    "value" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_deal" (
    "id" TEXT NOT NULL,
    "opportunityId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_deal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_activity" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "meta" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_stripeSessionId_key" ON "payment"("stripeSessionId");

-- CreateIndex
CREATE INDEX "payment_organizationId_idx" ON "payment"("organizationId");

-- CreateIndex
CREATE INDEX "usage_record_organizationId_type_createdAt_idx" ON "usage_record"("organizationId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "crm_customer_organizationId_idx" ON "crm_customer"("organizationId");

-- CreateIndex
CREATE INDEX "crm_lead_customerId_idx" ON "crm_lead"("customerId");

-- CreateIndex
CREATE INDEX "crm_lead_status_idx" ON "crm_lead"("status");

-- CreateIndex
CREATE INDEX "crm_opportunity_customerId_idx" ON "crm_opportunity"("customerId");

-- CreateIndex
CREATE INDEX "crm_opportunity_stage_idx" ON "crm_opportunity"("stage");

-- CreateIndex
CREATE INDEX "crm_deal_opportunityId_idx" ON "crm_deal"("opportunityId");

-- CreateIndex
CREATE INDEX "crm_deal_status_idx" ON "crm_deal"("status");

-- CreateIndex
CREATE INDEX "crm_activity_customerId_timestamp_idx" ON "crm_activity"("customerId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_planId_email_intent_key" ON "Lead"("planId", "email", "intent");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_record" ADD CONSTRAINT "usage_record_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_customer" ADD CONSTRAINT "crm_customer_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_lead" ADD CONSTRAINT "crm_lead_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunity" ADD CONSTRAINT "crm_opportunity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_deal" ADD CONSTRAINT "crm_deal_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "crm_opportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activity" ADD CONSTRAINT "crm_activity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "crm_customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

