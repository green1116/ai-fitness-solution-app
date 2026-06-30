/**
 * V65 P1 — Legacy issue inventory (resolved snapshot after P2–P5)
 */
import type { LegacyIssue } from "./audit.types";

export const LEGACY_ISSUE_INVENTORY: readonly LegacyIssue[] = [
  {
    id: "TS-001",
    category: "typecheck",
    severity: "medium",
    file: "app/(documents)/documents/quotes/[quoteId]/page.tsx",
    summary: "data.latest is possibly undefined",
    blocker: false,
    remediation: "Add null guard or optional chaining before accessing latest quote revision",
    status: "resolved",
    resolvedBy: "V65-P3",
  },
  {
    id: "TS-002",
    category: "feature-gate",
    severity: "high",
    file: "lib/feature-flags/feature-gate.ts",
    summary: "subscription.plan typed as string; SaasPlan expected (5 errors)",
    blocker: false,
    remediation: "Align Subscription Prisma model plan field with SaasPlan enum or cast at service boundary",
    status: "resolved",
    resolvedBy: "V65-P2+P5",
  },
  {
    id: "TS-003",
    category: "organization",
    severity: "critical",
    file: "lib/organization/organization.service.ts",
    summary: "Organization.slug referenced but absent from Prisma schema (2 errors)",
    blocker: false,
    remediation: "Restore slug column in schema + migration, or remove slug usage from service",
    status: "resolved",
    resolvedBy: "V65-P2",
  },
  {
    id: "TS-004",
    category: "portal",
    severity: "high",
    file: "lib/portal/v57/experience/workspace-summary.service.ts",
    summary: "Organization.slug missing; name nullable vs required (2 errors)",
    blocker: false,
    remediation: "Sync portal workspace summary types with current Organization model",
    status: "resolved",
    resolvedBy: "V65-P2+P5",
  },
  {
    id: "TS-005",
    category: "verify-script",
    severity: "low",
    file: "scripts/verify-v64-p6-commercial-transition.ts",
    summary: "Strict null checks on transition step fields (4 errors)",
    blocker: false,
    remediation: "Narrow types or add assertions in verify script only",
    status: "resolved",
    resolvedBy: "V65-P3",
  },
  {
    id: "PRISMA-001",
    category: "prisma-schema-drift",
    severity: "critical",
    file: "prisma/schema.prisma",
    summary: "Schema diff CRITICAL — 23 breaking changes vs baseline",
    blocker: false,
    remediation: "Reconcile schema with .prisma-stability baseline or update baseline after reviewed migration",
    status: "resolved",
    resolvedBy: "V65-P2",
  },
  {
    id: "PRISMA-002",
    category: "prisma-schema-drift",
    severity: "critical",
    file: "prisma/schema.prisma",
    summary: "19 blocked migration operations (Organization.slug, SaasInvoice relations, Subscription enums)",
    blocker: false,
    remediation: "Apply idempotent patches (e.g. v59_saas_tables) and align Subscription/SaasInvoice models",
    status: "resolved",
    resolvedBy: "V65-P2",
  },
  {
    id: "PRISMA-003",
    category: "prisma-schema-drift",
    severity: "high",
    file: "lib/billing/subscription.service.ts",
    summary: "Runtime casts subscription.plan as SaasPlan despite schema String drift",
    blocker: false,
    remediation: "Restore SaasPlan enum on Subscription.plan or update all consumers to string plan IDs",
    status: "resolved",
    resolvedBy: "V65-P2+P5",
  },
] as const;

export function countIssuesByCategory(): Record<LegacyIssue["category"], number> {
  const counts = {
    typecheck: 0,
    "prisma-schema-drift": 0,
    organization: 0,
    "feature-gate": 0,
    portal: 0,
    "verify-script": 0,
    dependency: 0,
    commercial: 0,
  } satisfies Record<LegacyIssue["category"], number>;

  for (const issue of LEGACY_ISSUE_INVENTORY) {
    counts[issue.category] += 1;
  }
  return counts;
}

export function countOpenLegacyBlockers(): number {
  return LEGACY_ISSUE_INVENTORY.filter(
    (issue) => issue.blocker && issue.status !== "resolved",
  ).length;
}

/** @deprecated use countOpenLegacyBlockers */
export function countBlockers(): number {
  return countOpenLegacyBlockers();
}
