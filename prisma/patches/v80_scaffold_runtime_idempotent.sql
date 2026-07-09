-- V80 CODE P3 — idempotent runtime tables (apply manually if needed)

CREATE TABLE IF NOT EXISTS "v80_scaffold_organization" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "adminEmail" TEXT NOT NULL DEFAULT '',
  "plan" TEXT NOT NULL DEFAULT 'BASIC',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "v80_scaffold_project" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_project_organizationId_fkey"
    FOREIGN KEY ("organizationId") REFERENCES "v80_scaffold_organization"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_project_organizationId_idx" ON "v80_scaffold_project"("organizationId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_tender" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "tenderType" TEXT NOT NULL DEFAULT 'enterprise-gym',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_tender_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "v80_scaffold_project"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_tender_projectId_idx" ON "v80_scaffold_tender"("projectId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_quote" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_quote_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "v80_scaffold_project"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_quote_projectId_idx" ON "v80_scaffold_quote"("projectId");
CREATE INDEX IF NOT EXISTS "v80_scaffold_quote_organizationId_idx" ON "v80_scaffold_quote"("organizationId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_budget" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "quoteId" TEXT NOT NULL,
  "tier" TEXT NOT NULL,
  "companySize" INTEGER NOT NULL DEFAULT 0,
  "totalAmount" INTEGER NOT NULL DEFAULT 0,
  "idempotencyKey" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_budget_quoteId_fkey"
    FOREIGN KEY ("quoteId") REFERENCES "v80_scaffold_quote"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_budget_quoteId_idx" ON "v80_scaffold_budget"("quoteId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_document_export" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "data" BYTEA,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_document_export_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "v80_scaffold_project"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_document_export_projectId_idx" ON "v80_scaffold_document_export"("projectId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_plan_job" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "workflowKey" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "steps" JSONB NOT NULL DEFAULT '[]',
  "idempotencyKey" TEXT NOT NULL UNIQUE,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_plan_job_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "v80_scaffold_project"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_plan_job_projectId_idx" ON "v80_scaffold_plan_job"("projectId");

CREATE TABLE IF NOT EXISTS "v80_scaffold_usage_record" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  "usageType" TEXT NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "v80_scaffold_usage_record_org_type_key" UNIQUE ("organizationId", "usageType")
);
CREATE INDEX IF NOT EXISTS "v80_scaffold_usage_record_organizationId_idx" ON "v80_scaffold_usage_record"("organizationId");
