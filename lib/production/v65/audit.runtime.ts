/**
 * V65 P1 — Runtime blocker inventory (read-only)
 */
import type { RuntimeBlocker } from "./audit.types";

export const RUNTIME_BLOCKER_INVENTORY: readonly RuntimeBlocker[] = [
  {
    id: "RT-001",
    area: "organization-onboarding",
    severity: "critical",
    summary: "createOrganization uses Organization.slug but schema has no slug field",
    impact: "Organization creation fails at Prisma runtime when slug is written",
  },
  {
    id: "RT-002",
    area: "feature-gating",
    severity: "high",
    summary: "Feature gate assumes SaasPlan enum; subscription.plan may be plain string at DB layer",
    impact: "Plan resolution and usage limits may mis-resolve if plan values drift from SaasPlan literals",
  },
  {
    id: "RT-003",
    area: "portal-workspace",
    severity: "high",
    summary: "Workspace summary expects organization.slug and non-null name",
    impact: "Portal workspace summary may throw or return incomplete data for organizations",
  },
  {
    id: "RT-004",
    area: "saas-billing",
    severity: "critical",
    summary: "SaasInvoice / Subscription model drift vs services expecting v59 SaaS tables",
    impact: "Billing, invoice, and subscription flows may fail against current Prisma client",
  },
  {
    id: "RT-005",
    area: "documents-quotes",
    severity: "medium",
    summary: "Quote detail page accesses data.latest without guard",
    impact: "Edge-case render error when quote has no latest revision",
  },
] as const;
