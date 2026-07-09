/**
 * V80 POST-LAUNCH P4 — Closed-loop growth flywheel (data → PDF → revenue → reinvest → new leads)
 * Self-sustaining loop — no external trigger required after bootstrap
 */
import { REVENUE_COMPOUNDING_LOOPS } from "./scaling.compounding.spec";
import { GROWTH_FLYWHEEL } from "@/lib/product/v80/scale.flywheel.spec";
import type { ClosedLoopFlywheelStage } from "./autonomy.types";

export const CLOSED_LOOP_GROWTH_FLYWHEEL: ClosedLoopFlywheelStage[] = [
  {
    id: "REV-AUT-FLW-001",
    order: 1,
    phase: "data",
    input: "Tender intake + budget + workflow usage per org",
    output: "Entitlement + usage intelligence — upgrade signals",
    apiRoute: "/api/v80/entitlements",
    p3Ref: "REV-SCL-CMP-006",
    loopClosure: "Usage data feeds autonomous expansion rules",
    required: true,
  },
  {
    id: "REV-AUT-FLW-002",
    order: 2,
    phase: "data",
    input: "Governance audit trail — access patterns",
    output: "Lead signals from unknown domains + expansion candidates",
    apiRoute: "/api/v80/ops/governance/audit",
    p3Ref: "REV-SCL-AUT-008",
    loopClosure: "Audit data → autonomous lead generation",
    required: true,
  },
  {
    id: "REV-AUT-FLW-003",
    order: 3,
    phase: "pdf",
    input: "Auto-rendered plan + budget + proposal PDFs",
    output: "Shareable deliverables — external distribution",
    apiRoute: "/api/v80/pdf",
    p3Ref: "REV-SCL-CMP-003",
    loopClosure: "PDF virality → inbound leads without CAC",
    required: true,
  },
  {
    id: "REV-AUT-FLW-004",
    order: 4,
    phase: "pdf",
    input: "Proposal PDF client delivery",
    output: "Stakeholder proof → account expansion triggers",
    apiRoute: "/api/v80/proposal-pdf/render",
    p3Ref: "REV-AUT-SLS-004",
    loopClosure: "Proposal → multi-site tender program signal",
    required: true,
  },
  {
    id: "REV-AUT-FLW-005",
    order: 5,
    phase: "revenue",
    input: "mapUsageToCharge — BUDGET/TENDER/PDF metered",
    output: "Recorded charges + entitlement trail",
    apiRoute: "/api/v80/budget/calculate",
    p3Ref: "REV-ACT-006",
    loopClosure: "Metered revenue compounds ARPA per account",
    required: true,
  },
  {
    id: "REV-AUT-FLW-006",
    order: 6,
    phase: "revenue",
    input: "FEATURE_GATE + USAGE_LIMIT autonomous upgrades",
    output: "PRO/ENTERPRISE subscription revenue",
    apiRoute: "/api/v80/autopilot/job/run",
    p3Ref: "REV-AUT-EXP-003",
    loopClosure: "Gate-driven upgrades — zero human close",
    required: true,
  },
  {
    id: "REV-AUT-FLW-007",
    order: 7,
    phase: "reinvest",
    input: "Surplus ARR from compounding cycles",
    output: "PLG tenant slots + partner co-sell fund",
    apiRoute: "/api/v80/tenant/run",
    p3Ref: "REV-SCL-CMP-008",
    loopClosure: "Reinvested revenue → lower CAC inbound",
    required: true,
  },
  {
    id: "REV-AUT-FLW-008",
    order: 8,
    phase: "leads",
    input: "PDF share opens + marketplace + partner signals",
    output: "New tenant provisioned — loop restarts",
    apiRoute: "/api/v80/tender/intake",
    p3Ref: "REV-AUT-LDG-003",
    loopClosure: "New leads → intake → data phase — flywheel closed",
    required: true,
  },
];

export function isClosedLoopGrowthFlywheelComplete(): boolean {
  const phases = new Set(CLOSED_LOOP_GROWTH_FLYWHEEL.map((f) => f.phase));
  const compoundingIds = new Set(REVENUE_COMPOUNDING_LOOPS.map((l) => l.id));
  const flywheelIds = new Set(GROWTH_FLYWHEEL.map((f) => f.id));

  return (
    CLOSED_LOOP_GROWTH_FLYWHEEL.length === 8 &&
    phases.has("data") &&
    phases.has("pdf") &&
    phases.has("revenue") &&
    phases.has("reinvest") &&
    phases.has("leads") &&
    CLOSED_LOOP_GROWTH_FLYWHEEL.every((f, i) => f.order === i + 1) &&
    CLOSED_LOOP_GROWTH_FLYWHEEL[7]!.phase === "leads" &&
    CLOSED_LOOP_GROWTH_FLYWHEEL[0]!.phase === "data" &&
    compoundingIds.size >= 8 &&
    flywheelIds.size >= 5
  );
}
