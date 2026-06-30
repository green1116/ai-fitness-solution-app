/**
 * V65 P1 — Build blocker inventory (read-only)
 */
import type { BuildBlocker } from "./audit.types";

export const BUILD_BLOCKER_INVENTORY: readonly BuildBlocker[] = [
  {
    id: "BUILD-001",
    source: "prisma-preflight",
    severity: "critical",
    summary: "Prisma preflight fails — blocks npm run build",
    detail:
      "schema_diff: 23 breaking changes, 4 warnings, Risk CRITICAL; migration_safety: 19 blocked operations",
  },
  {
    id: "BUILD-002",
    source: "typescript",
    severity: "high",
    summary: "npx tsc --noEmit exits non-zero (14 errors in 5 files)",
    detail:
      "feature-gate, organization.service, workspace-summary.service, quotes page, verify-v64-p6 script",
  },
  {
    id: "BUILD-003",
    source: "next-build",
    severity: "critical",
    summary: "next build never reached — prebuild prisma:validate + prisma:snapshot then prisma:preflight gate",
    detail: "Build script: STRICT_CLIENT_SYNC=1 prisma:preflight && prisma:diff && migration-safety && rollback-check && next build",
  },
] as const;

/** Active build blockers — empty after V65 P2–P4 */
export const ACTIVE_BUILD_BLOCKERS: readonly BuildBlocker[] = [] as const;

export function countActiveBuildBlockers(): number {
  return ACTIVE_BUILD_BLOCKERS.length;
}

/** Historical reference for P1 audit (pre-P2) */
export const PRISMA_BLOCKED_OPERATIONS_HISTORICAL: readonly string[] = [
  "Organization.slug removed (String)",
  "Organization.invoices removed (SaasInvoice[])",
  "Organization.crmCustomers removed (Customer[])",
  "Subscription.plan type changed: SaasPlan → String",
  "Subscription.status type changed: SaasSubStatus → String",
  "Subscription table map changed: subscription → Subscription",
  "SaasInvoice.organizationId removed (String)",
  "SaasInvoice.subscriptionId optionality changed: String? → String",
  "SaasInvoice.stripeInvoiceId removed (String?)",
  "SaasInvoice.updatedAt removed (DateTime)",
  "SaasInvoice.organization removed (Organization)",
  "SaasInvoice.subscription optionality changed: Subscription? → Subscription",
  "SaasInvoice table map changed: saas_invoice → SaasInvoice",
  "Organization.invoices relation removed",
  "Organization.crmCustomers relation removed",
  "Subscription.plan relation removed (was → SaasPlan)",
  "Subscription.status relation removed (was → SaasSubStatus)",
  "SaasInvoice.organization relation removed",
  "SaasInvoice.subscription relation cardinality changed",
] as const;

/** @deprecated use PRISMA_BLOCKED_OPERATIONS_HISTORICAL */
export const PRISMA_BLOCKED_OPERATIONS = PRISMA_BLOCKED_OPERATIONS_HISTORICAL;
