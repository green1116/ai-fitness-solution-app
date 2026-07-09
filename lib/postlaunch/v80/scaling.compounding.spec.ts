/**
 * V80 POST-LAUNCH P3 — Revenue compounding loops (usage → value → expansion cycles)
 * Extends P1 REVENUE_ACTIVATION_LOOP + PRODUCT P3 GROWTH_FLYWHEEL
 */
import { GROWTH_FLYWHEEL } from "@/lib/product/v80/scale.flywheel.spec";
import { REVENUE_ACTIVATION_LOOP } from "./revenue.loop.spec";
import type { RevenueCompoundingLoop } from "./scaling.types";

export const REVENUE_COMPOUNDING_LOOPS: RevenueCompoundingLoop[] = [
  {
    id: "REV-SCL-CMP-001",
    cycle: 1,
    phase: "usage",
    input: "Tender intake volume per org",
    output: "QUOTE usage + project intelligence",
    apiRoute: "/api/v80/tender/intake",
    p1LoopRef: "REV-ACT-001",
    flywheelRef: "PRD-FLW-001",
    compoundingMultiplier: "Each intake → faster next quote (data moat)",
    required: true,
  },
  {
    id: "REV-SCL-CMP-002",
    cycle: 1,
    phase: "usage",
    input: "Budget + autopilot API calls",
    output: "BUDGET/TENDER metered charges + upgrade signals",
    apiRoute: "/api/v80/budget/calculate",
    p1LoopRef: "REV-ACT-002",
    flywheelRef: "PRD-FLW-001",
    compoundingMultiplier: "Usage density → ARPA compounds per account",
    required: true,
  },
  {
    id: "REV-SCL-CMP-003",
    cycle: 2,
    phase: "value",
    input: "PDF deliverables shared externally",
    output: "Inbound leads + partner referrals",
    apiRoute: "/api/v80/pdf",
    p1LoopRef: "REV-ACT-004",
    flywheelRef: "PRD-FLW-003",
    compoundingMultiplier: "PDF virality → new org signups without CAC",
    required: true,
  },
  {
    id: "REV-SCL-CMP-004",
    cycle: 2,
    phase: "value",
    input: "Proposal PDF client delivery",
    output: "Stakeholder proof → expansion within account",
    apiRoute: "/api/v80/proposal-pdf/render",
    p1LoopRef: "REV-ACT-005",
    flywheelRef: "PRD-FLW-003",
    compoundingMultiplier: "1 proposal → multi-site tender program",
    required: true,
  },
  {
    id: "REV-SCL-CMP-005",
    cycle: 3,
    phase: "expansion",
    input: "FEATURE_GATE + USAGE_LIMIT triggers",
    output: "BASIC→PRO→ENTERPRISE upgrades",
    apiRoute: "/api/v80/autopilot/job/run",
    p1LoopRef: "REV-ACT-009",
    flywheelRef: "PRD-FLW-005",
    compoundingMultiplier: "Upgrade revenue funds channel scaling",
    required: true,
  },
  {
    id: "REV-SCL-CMP-006",
    cycle: 3,
    phase: "expansion",
    input: "Entitlement + usage data per org",
    output: "Expansion path signals (PRD-EXP-*)",
    apiRoute: "/api/v80/entitlements",
    flywheelRef: "PRD-FLW-002",
    compoundingMultiplier: "Data-driven upsell timing compounds LTV",
    required: true,
  },
  {
    id: "REV-SCL-CMP-007",
    cycle: 4,
    phase: "reinvest",
    input: "Workflow lock-in (8-step tender pack)",
    output: "Switching cost → retention + cross-sell",
    apiRoute: "/api/v80/autopilot/job/run",
    p1LoopRef: "REV-ACT-003",
    flywheelRef: "PRD-FLW-004",
    compoundingMultiplier: "Workflow depth → 3× repeat tender rate",
    required: true,
  },
  {
    id: "REV-SCL-CMP-008",
    cycle: 4,
    phase: "reinvest",
    input: "Channel revenue → PLG + partner co-sell",
    output: "New org intake at lower CAC",
    apiRoute: "/api/v80/tenant/run",
    flywheelRef: "PRD-FLW-005",
    compoundingMultiplier: "Reinvested ARR → 2× inbound conversion",
    required: true,
  },
];

export function isRevenueCompoundingLoopsComplete(): boolean {
  const phases = new Set(REVENUE_COMPOUNDING_LOOPS.map((l) => l.phase));
  const loopIds = new Set(REVENUE_ACTIVATION_LOOP.map((s) => s.id));
  const flywheelIds = new Set(GROWTH_FLYWHEEL.map((f) => f.id));

  return (
    REVENUE_COMPOUNDING_LOOPS.length === 8 &&
    phases.has("usage") &&
    phases.has("value") &&
    phases.has("expansion") &&
    phases.has("reinvest") &&
    REVENUE_COMPOUNDING_LOOPS.filter((l) => l.p1LoopRef).every((l) => loopIds.has(l.p1LoopRef!)) &&
    REVENUE_COMPOUNDING_LOOPS.filter((l) => l.flywheelRef).every((l) => flywheelIds.has(l.flywheelRef!))
  );
}
