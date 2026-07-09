/**
 * V80 POST-LAUNCH P1 — First customer path optimization (tender → PDF → paid conversion)
 * Maps DEPLOY P2 FIRST_TENANT_LIVE_FLOW → revenue checkpoints
 */
import { FIRST_TENANT_LIVE_FLOW } from "@/lib/deploy/v80/deploy.first-tenant.spec";
import type { FirstCustomerRevenueStep } from "./revenue.types";

export const FIRST_CUSTOMER_REVENUE_PATH: FirstCustomerRevenueStep[] = [
  {
    id: "REV-FST-001",
    tenantStepRef: "DEP-TNT-001",
    order: 1,
    revenueMoment: "activation",
    optimization: "Provision PRO tenant — skip BASIC trial friction for first paid customer",
    required: true,
  },
  {
    id: "REV-FST-002",
    tenantStepRef: "DEP-TNT-002",
    order: 2,
    revenueMoment: "activation",
    optimization: "Confirm entitlements unlock full revenue loop (budget + tender + PDF)",
    billingCheckpoint: "tier=PRO, all commercial features enabled",
    required: true,
  },
  {
    id: "REV-FST-003",
    tenantStepRef: "DEP-TNT-003",
    order: 3,
    revenueMoment: "activation",
    optimization: "First tender intake — PQL signal; track quote usage toward 50/mo cap",
    conversionRef: "PRD-FUN-003",
    required: true,
  },
  {
    id: "REV-FST-004",
    tenantStepRef: "DEP-TNT-004",
    order: 4,
    revenueMoment: "usage-charge",
    optimization: "Budget calculate — first billable event (BUDGET ¢50); surface value before invoice",
    billingCheckpoint: "usage BUDGET recorded; chargeCents=50",
    conversionRef: "PRD-CNV-001",
    required: true,
  },
  {
    id: "REV-FST-005",
    tenantStepRef: "DEP-TNT-005",
    order: 5,
    revenueMoment: "usage-charge",
    optimization: "Autopilot complete — highest unit charge (TENDER ¢200); upsell capacity at limit",
    billingCheckpoint: "workflow_run usage incremented",
    conversionRef: "PRD-CNV-004",
    required: true,
  },
  {
    id: "REV-FST-006",
    tenantStepRef: "DEP-TNT-006",
    order: 6,
    revenueMoment: "value-proof",
    optimization: "Plan PDF download — activation milestone; share externally to drive expansion",
    conversionRef: "PRD-FUN-004",
    required: true,
  },
  {
    id: "REV-FST-007",
    tenantStepRef: "DEP-TNT-007",
    order: 7,
    revenueMoment: "upgrade-prompt",
    optimization: "Proposal PDF render — paid conversion moment; attach subscription checkout CTA",
    billingCheckpoint: "usage PDF; chargeCents=25",
    conversionRef: "PRD-CNV-003",
    required: true,
  },
  {
    id: "REV-FST-008",
    tenantStepRef: "DEP-TNT-008",
    order: 8,
    revenueMoment: "audit-trail",
    optimization: "Governance audit — prove ROI for renewal; entitlement trail = billing dispute defense",
    billingCheckpoint: "entitlement trail logged for all commercial routes",
    required: true,
  },
];

export function isFirstCustomerRevenuePathComplete(): boolean {
  const tenantIds = new Set(FIRST_TENANT_LIVE_FLOW.map((s) => s.id));

  return (
    FIRST_CUSTOMER_REVENUE_PATH.length === 8 &&
    FIRST_CUSTOMER_REVENUE_PATH.every((s, i) => s.order === i + 1) &&
    FIRST_CUSTOMER_REVENUE_PATH.every((s) => tenantIds.has(s.tenantStepRef)) &&
    FIRST_CUSTOMER_REVENUE_PATH.filter((s) => s.billingCheckpoint).length >= 4 &&
    FIRST_CUSTOMER_REVENUE_PATH.filter((s) => s.revenueMoment === "usage-charge").length >= 2 &&
    FIRST_CUSTOMER_REVENUE_PATH.some((s) => s.revenueMoment === "upgrade-prompt")
  );
}
