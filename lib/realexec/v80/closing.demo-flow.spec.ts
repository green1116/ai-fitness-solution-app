/**
 * V80 REAL EXEC P2 — Demo flow (10–30 min using V80 system)
 * Timed walkthrough — maps GTM P2 FIRST_DEAL_EXECUTION_FLOW
 */
import { FIRST_DEAL_EXECUTION_FLOW } from "@/lib/gtm/v80/execution.deal-flow.spec";
import type { DemoFlowStep } from "./closing.types";

export const DEMO_FLOW_30MIN: DemoFlowStep[] = [
  {
    id: "REX-DMO-001",
    order: 1,
    minuteMark: "0–2",
    durationMin: 2,
    showWhat: "Provision PRO workspace — confirm entitlements (budget+tender+PDF)",
    apiRoute: "/api/v80/tenant/run",
    buyerTakeaway: "You're on a live workspace — not a sandbox",
    executionRef: "GTM-EXE-001",
    required: true,
  },
  {
    id: "REX-DMO-002",
    order: 2,
    minuteMark: "2–5",
    durationMin: 3,
    showWhat: "Upload tender spec → intake returns tenderId + quoteId",
    apiRoute: "/api/v80/tender/intake",
    buyerTakeaway: "Your project is structured — ready for budget",
    executionRef: "GTM-EXE-003",
    required: true,
  },
  {
    id: "REX-DMO-003",
    order: 3,
    minuteMark: "5–10",
    durationMin: 5,
    showWhat: "Calculate budget — equipment line items + totals on screen",
    apiRoute: "/api/v80/budget/calculate",
    buyerTakeaway: "Real numbers procurement can sign off on",
    executionRef: "GTM-EXE-004",
    required: true,
  },
  {
    id: "REX-DMO-004",
    order: 4,
    minuteMark: "10–12",
    durationMin: 2,
    showWhat: "Download plan PDF — shareable activation deliverable",
    apiRoute: "/api/v80/pdf?type=plan",
    buyerTakeaway: "Stakeholder-ready document in 2 clicks",
    executionRef: "GTM-EXE-005",
    required: true,
  },
  {
    id: "REX-DMO-005",
    order: 5,
    minuteMark: "12–20",
    durationMin: 8,
    showWhat: "Run autopilot tender-pack — 8 steps, artifacts appear live",
    apiRoute: "/api/v80/autopilot/job/run",
    buyerTakeaway: "Full response bundle without manual assembly",
    executionRef: "GTM-EXE-006",
    required: true,
  },
  {
    id: "REX-DMO-006",
    order: 6,
    minuteMark: "20–24",
    durationMin: 4,
    showWhat: "Render proposal PDF — downloadUrl for client delivery",
    apiRoute: "/api/v80/proposal-pdf/render",
    buyerTakeaway: "Client-ready proposal — your bid is submission-ready",
    executionRef: "GTM-EXE-007",
    required: true,
  },
  {
    id: "REX-DMO-007",
    order: 7,
    minuteMark: "24–27",
    durationMin: 3,
    showWhat: "Show governance audit trail — entitlement log for procurement DD",
    apiRoute: "/api/v80/ops/governance/audit",
    buyerTakeaway: "Audit proof — reduces vendor risk objection",
    executionRef: "GTM-EXE-009",
    required: true,
  },
  {
    id: "REX-DMO-008",
    order: 8,
    minuteMark: "27–30",
    durationMin: 3,
    showWhat: "Recap deliverables + transition to close — FitScale PRO offer",
    apiRoute: "/api/v80/entitlements",
    buyerTakeaway: "You keep this workspace for every upcoming bid",
    executionRef: "GTM-EXE-008",
    required: true,
  },
];

export function isDemoFlowComplete(): boolean {
  const totalMin = DEMO_FLOW_30MIN.reduce((sum, s) => sum + s.durationMin, 0);

  return (
    DEMO_FLOW_30MIN.length === 8 &&
    DEMO_FLOW_30MIN.every((s, i) => s.order === i + 1) &&
    totalMin >= 28 &&
    totalMin <= 32 &&
    DEMO_FLOW_30MIN.filter((s) => s.executionRef?.startsWith("GTM-EXE")).length >= 7 &&
    FIRST_DEAL_EXECUTION_FLOW.length >= 10
  );
}
