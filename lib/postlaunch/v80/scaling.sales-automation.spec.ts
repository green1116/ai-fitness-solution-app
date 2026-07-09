/**
 * V80 POST-LAUNCH P3 — Sales automation engine (lead scoring → PDF → proposal → close)
 * Automates PRODUCT P2 SALES_FUNNEL via P2 optimization surfaces
 */
import { SALES_FUNNEL_STAGES } from "@/lib/product/v80/growth.funnel.spec";
import type { SalesAutomationStep } from "./scaling.types";

export const SALES_AUTOMATION_ENGINE: SalesAutomationStep[] = [
  {
    id: "REV-SCL-AUT-001",
    order: 1,
    stage: "lead_score",
    trigger: "Landing/demo request captured",
    apiRoute: "/api/v80/tenant/run",
    automationAction: "Score MQL by segment (gym operator vs integrator) — route to PLG or ABM",
    required: true,
  },
  {
    id: "REV-SCL-AUT-002",
    order: 2,
    stage: "lead_score",
    trigger: "Tenant provisioned — plan tier assigned",
    apiRoute: "/api/v80/entitlements",
    automationAction: "PQL score from tier + feature flags — prioritize PRO trial candidates",
    p2Ref: "REV-OPT-LK-001",
    required: true,
  },
  {
    id: "REV-SCL-AUT-003",
    order: 3,
    stage: "qualify",
    trigger: "First tender intake submitted",
    apiRoute: "/api/v80/tender/intake",
    automationAction: "Auto-qualify: intake within 72h → active PQL; else nurture sequence",
    p2Ref: "REV-OPT-CNV-007",
    required: true,
  },
  {
    id: "REV-SCL-AUT-004",
    order: 4,
    stage: "qualify",
    trigger: "Budget calculated — billable usage recorded",
    apiRoute: "/api/v80/budget/calculate",
    automationAction: "SQL signal: budget calc → assign AE for accounts >$10k equipment",
    p2Ref: "REV-OPT-CNV-001",
    required: true,
  },
  {
    id: "REV-SCL-AUT-005",
    order: 5,
    stage: "pdf",
    trigger: "Plan PDF downloaded — activation milestone",
    apiRoute: "/api/v80/pdf?type=plan",
    automationAction: "Auto-send budget PDF CTA + schedule follow-up if no proposal in 48h",
    p2Ref: "REV-OPT-CNV-006",
    required: true,
  },
  {
    id: "REV-SCL-AUT-006",
    order: 6,
    stage: "pdf",
    trigger: "Budget PDF preview on BASIC",
    apiRoute: "/api/v80/pdf?type=budget",
    automationAction: "Watermark preview → automated upgrade email with saved quote context",
    p2Ref: "REV-OPT-CNV-005",
    required: true,
  },
  {
    id: "REV-SCL-AUT-007",
    order: 7,
    stage: "proposal",
    trigger: "Proposal PDF rendered — client-ready artifact",
    apiRoute: "/api/v80/proposal-pdf/render",
    automationAction: "Proposal delivery notification + annual upgrade offer at peak WTP",
    p2Ref: "REV-OPT-CNV-002",
    required: true,
  },
  {
    id: "REV-SCL-AUT-008",
    order: 8,
    stage: "close",
    trigger: "Autopilot complete + governance audit logged",
    apiRoute: "/api/v80/ops/governance/audit",
    automationAction: "Close loop: audit trail → renewal quote + ENTERPRISE bridge if multi-site",
    p2Ref: "REV-OPT-ENT-003",
    required: true,
  },
];

export function isSalesAutomationEngineComplete(): boolean {
  const funnelStages = new Set(SALES_FUNNEL_STAGES.map((s) => s.stage));
  const stages = new Set(SALES_AUTOMATION_ENGINE.map((s) => s.stage));

  return (
    SALES_AUTOMATION_ENGINE.length === 8 &&
    stages.has("lead_score") &&
    stages.has("qualify") &&
    stages.has("pdf") &&
    stages.has("proposal") &&
    stages.has("close") &&
    SALES_AUTOMATION_ENGINE.every((s, i) => s.order === i + 1) &&
    funnelStages.has("lead") &&
    funnelStages.has("paid") &&
    SALES_AUTOMATION_ENGINE.filter((s) => s.p2Ref).length >= 6
  );
}
