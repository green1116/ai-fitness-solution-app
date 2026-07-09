/**
 * V80 POST-LAUNCH P4 — Autonomous expansion engine (usage → upgrade → multi-org scaling)
 * Zero human expansion decisions — reuses P1 gates + P3 enterprise model
 */
import { ENTERPRISE_EXPANSION_MODEL } from "./scaling.enterprise-expansion.spec";
import { PRICING_PRESSURE_POINTS } from "./revenue.pricing-pressure.spec";
import type { AutonomousExpansionRule } from "./autonomy.types";

export const AUTONOMOUS_EXPANSION_ENGINE: AutonomousExpansionRule[] = [
  {
    id: "REV-AUT-EXP-001",
    order: 1,
    signal: "FEATURE_GATE on budget/calculate — BASIC user",
    apiRoute: "/api/v80/budget/calculate",
    expansionTarget: "PRO",
    p3Ref: "REV-PAY-001",
    autonomousAction: "Gate hit → auto-initiate FitScale upgrade checkout with partial totals",
    required: true,
  },
  {
    id: "REV-AUT-EXP-002",
    order: 2,
    signal: "7/10 quote usage — proactive cap warning",
    apiRoute: "/api/v80/tender/intake",
    expansionTarget: "PRO",
    p3Ref: "REV-OPT-YLD-003",
    autonomousAction: "70% cap → auto-send PRO upgrade before USAGE_LIMIT 429",
    required: true,
  },
  {
    id: "REV-AUT-EXP-003",
    order: 3,
    signal: "USAGE_LIMIT 429 on autopilot — tender cap hit",
    apiRoute: "/api/v80/autopilot/job/run",
    expansionTarget: "PRO",
    p3Ref: "REV-OPT-YLD-005",
    autonomousAction: "429 → auto-offer capacity add-on + annual discount — no churn default",
    required: true,
  },
  {
    id: "REV-AUT-EXP-004",
    order: 4,
    signal: "Proposal render success — peak willingness-to-pay",
    apiRoute: "/api/v80/proposal-pdf/render",
    expansionTarget: "PRO",
    p3Ref: "REV-OPT-YLD-008",
    autonomousAction: "Render success → auto-present annual upgrade offer",
    required: true,
  },
  {
    id: "REV-AUT-EXP-005",
    order: 5,
    signal: "Budget cap 45/50 — ENTERPRISE bridge signal",
    apiRoute: "/api/v80/budget/calculate",
    expansionTarget: "ENTERPRISE",
    p3Ref: "REV-OPT-YLD-006",
    autonomousAction: "Cap pressure → auto-route to sales-assist ENTERPRISE bridge",
    required: true,
  },
  {
    id: "REV-AUT-EXP-006",
    order: 6,
    signal: "Bundle download gate — multi-site buyer detected",
    apiRoute: "/api/v80/pdf?artifactId",
    expansionTarget: "ENTERPRISE",
    p3Ref: "REV-SCL-EXP-007",
    autonomousAction: "Bundle gate → auto-provision ENTERPRISE tenant + contract template",
    required: true,
  },
  {
    id: "REV-AUT-EXP-007",
    order: 7,
    signal: "Workspace limit ≥ 5 — multi-org expansion",
    apiRoute: "/api/v80/tenant/run",
    expansionTarget: "multi-org",
    p3Ref: "REV-SCL-EXP-001",
    autonomousAction: "Workspace quota hit → auto-provision subsidiary under parent billing pool",
    required: true,
  },
  {
    id: "REV-AUT-EXP-008",
    order: 8,
    signal: "Cross-region integrity rollup — regional ARR threshold",
    apiRoute: "/api/v80/production/integrity",
    expansionTarget: "multi-org",
    p3Ref: "REV-SCL-EXP-005",
    autonomousAction: "Regional threshold → auto-replicate workspace to next region",
    required: true,
  },
];

export function isAutonomousExpansionEngineComplete(): boolean {
  const expansionIds = new Set(ENTERPRISE_EXPANSION_MODEL.map((e) => e.id));
  const pressureIds = new Set(PRICING_PRESSURE_POINTS.map((p) => p.id));
  const targets = new Set(AUTONOMOUS_EXPANSION_ENGINE.map((e) => e.expansionTarget));

  return (
    AUTONOMOUS_EXPANSION_ENGINE.length === 8 &&
    targets.has("PRO") &&
    targets.has("ENTERPRISE") &&
    targets.has("multi-org") &&
    AUTONOMOUS_EXPANSION_ENGINE.every((e, i) => e.order === i + 1) &&
    AUTONOMOUS_EXPANSION_ENGINE.filter((e) => e.expansionTarget === "PRO").length >= 4 &&
    AUTONOMOUS_EXPANSION_ENGINE.filter((e) => e.p3Ref?.startsWith("REV-SCL-EXP")).length >= 2 &&
    pressureIds.size >= 8 &&
    expansionIds.size >= 8
  );
}
