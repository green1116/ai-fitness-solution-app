-- Production Legacy Schema Retirement v1 (candidate)
-- Exact objects verified on production (empty orphan tables/columns).
-- Lead_* indexes omitted: already created by 0_init / missing_schema_alignment.

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_budget" DROP CONSTRAINT IF EXISTS "v80_scaffold_budget_quoteId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_document_export" DROP CONSTRAINT IF EXISTS "v80_scaffold_document_export_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_plan_job" DROP CONSTRAINT IF EXISTS "v80_scaffold_plan_job_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_quote" DROP CONSTRAINT IF EXISTS "v80_scaffold_quote_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_tender" DROP CONSTRAINT IF EXISTS "v80_scaffold_tender_projectId_fkey";

-- DropForeignKey
ALTER TABLE IF EXISTS "v80_scaffold_project" DROP CONSTRAINT IF EXISTS "v80_scaffold_project_organizationId_fkey";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_budget";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_document_export";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_plan_job";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_quote";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_tender";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_usage_record";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_project";

-- DropTable
DROP TABLE IF EXISTS "v80_scaffold_organization";

-- DropTable
DROP TABLE IF EXISTS "MarketingLead";

-- DropIndex
DROP INDEX IF EXISTS "crm_lead_email_idx";

-- DropIndex
DROP INDEX IF EXISTS "crm_lead_planId_idx";

-- AlterTable
ALTER TABLE "crm_lead" DROP COLUMN IF EXISTS "company",
DROP COLUMN IF EXISTS "email",
DROP COLUMN IF EXISTS "intent",
DROP COLUMN IF EXISTS "name",
DROP COLUMN IF EXISTS "note",
DROP COLUMN IF EXISTS "payload",
DROP COLUMN IF EXISTS "phone",
DROP COLUMN IF EXISTS "planId",
DROP COLUMN IF EXISTS "title";
