/**
 * V80 PRODUCT P2 — Sales funnel (lead → org → intake → PDF → paid upgrade)
 */
import type { SalesFunnelStage } from "./growth.types";

export const SALES_FUNNEL_STAGES: SalesFunnelStage[] = [
  {
    id: "PRD-FUN-001",
    stage: "lead",
    order: 1,
    touchpoint: "Landing / demo request",
    conversionGoal: "MQL captured — gym operator or integrator",
    required: true,
  },
  {
    id: "PRD-FUN-002",
    stage: "org",
    order: 2,
    touchpoint: "Signup wizard",
    apiRoute: "/api/v80/tenant/run",
    conversionGoal: "Tenant provisioned — FitStart trial",
    p1Ref: "PRD-ONB-001",
    required: true,
  },
  {
    id: "PRD-FUN-003",
    stage: "intake",
    order: 3,
    touchpoint: "First tender upload",
    apiRoute: "/api/v80/tender/intake",
    conversionGoal: "Product-qualified lead — active project",
    p1Ref: "PRD-ONB-003",
    required: true,
  },
  {
    id: "PRD-FUN-004",
    stage: "pdf",
    order: 4,
    touchpoint: "First PDF deliverable",
    apiRoute: "/api/v80/pdf?type=plan",
    pdfArtifact: "plan-pdf",
    conversionGoal: "Activation — value proven",
    p1Ref: "PRD-ONB-004",
    required: true,
  },
  {
    id: "PRD-FUN-005",
    stage: "paid",
    order: 5,
    touchpoint: "Upgrade checkout",
    apiRoute: "/api/v80/budget/calculate",
    conversionGoal: "Paid conversion — FitScale subscription",
    p1Ref: "PRD-ONB-006",
    required: true,
  },
];

export function isSalesFunnelComplete(): boolean {
  const stages = new Set(SALES_FUNNEL_STAGES.map((s) => s.stage));
  return (
    SALES_FUNNEL_STAGES.length === 5 &&
    stages.has("lead") &&
    stages.has("paid") &&
    SALES_FUNNEL_STAGES.every((s, i) => s.order === i + 1)
  );
}
