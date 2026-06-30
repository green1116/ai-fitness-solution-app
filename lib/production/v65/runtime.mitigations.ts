/**
 * V65 P5 — Runtime risk mitigation registry (read-only)
 */
import type { RuntimeRiskMitigation } from "./runtime.types";

export const RUNTIME_RISK_MITIGATIONS: readonly RuntimeRiskMitigation[] = [
  {
    id: "RT-001",
    area: "organization-onboarding",
    summary: "Organization.slug missing on legacy rows",
    mitigated: false,
    guard: "resolveOrganizationSlug",
    notes: "lib/organization/org.compat.ts",
  },
  {
    id: "RT-002",
    area: "feature-gating",
    summary: "Subscription plan string drift vs SaasPlan",
    mitigated: false,
    guard: "normalizeSaasPlan",
    notes: "lib/saas/plan.compat.ts",
  },
  {
    id: "RT-003",
    area: "portal-workspace",
    summary: "Workspace summary requires stable org slug/name",
    mitigated: false,
    guard: "resolveOrganizationDisplayName",
    notes: "lib/portal/v57/experience/workspace-summary.service.ts",
  },
  {
    id: "RT-004",
    area: "saas-billing",
    summary: "SaasInvoice create requires organizationId",
    mitigated: false,
    guard: "createInvoice.organizationId",
    notes: "lib/billing/invoice.service.ts",
  },
  {
    id: "RT-005",
    area: "documents-quotes",
    summary: "Quote delivery handler accesses latest without guard",
    mitigated: false,
    guard: "latest null guard",
    notes: "app/(documents)/documents/quotes/[quoteId]/page.tsx",
  },
] as const;
