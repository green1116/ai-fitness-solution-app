/**
 * E05-P8 — Intelligence gate summary (declarative, all P1–P8 phases)
 */

import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { E05_INTELLIGENCE_SIGNOFF_VERSION } from "./signoff.types";

export const INTELLIGENCE_GATE_CATALOG: Omit<
  GateSummaryEntry,
  "ok" | "state"
>[] = [
  {
    id: "EI-P1",
    phase: "P1",
    label: "Intelligence Foundation",
    verifyScript: "npx tsx scripts/verify-e05-p1-intelligence-foundation.ts",
  },
  {
    id: "EI-P2",
    phase: "P2",
    label: "Business Analytics Runtime",
    verifyScript: "npx tsx scripts/verify-e05-p2-business-analytics-runtime.ts",
  },
  {
    id: "EI-P3",
    phase: "P3",
    label: "KPI Intelligence Engine",
    verifyScript: "npx tsx scripts/verify-e05-p3-kpi-intelligence-engine.ts",
  },
  {
    id: "EI-P4",
    phase: "P4",
    label: "Forecasting Runtime",
    verifyScript: "npx tsx scripts/verify-e05-p4-forecasting-runtime.ts",
  },
  {
    id: "EI-P5",
    phase: "P5",
    label: "Optimization Engine",
    verifyScript: "npx tsx scripts/verify-e05-p5-optimization-engine.ts",
  },
  {
    id: "EI-P6",
    phase: "P6",
    label: "Enterprise Simulation Runtime",
    verifyScript:
      "npx tsx scripts/verify-e05-p6-enterprise-simulation-runtime.ts",
  },
  {
    id: "EI-P7",
    phase: "P7",
    label: "Autonomous Strategy Agent",
    verifyScript: "npx tsx scripts/verify-e05-p7-autonomous-strategy-agent.ts",
  },
  {
    id: "EI-P8",
    phase: "P8",
    label: "Intelligence Governance Freeze",
    verifyScript: "npx tsx scripts/verify-e05-p8-intelligence-governance.ts",
  },
];

function isAllPriorPhasesReady(readiness: ReadinessReport): boolean {
  return (
    readiness.p1 &&
    readiness.p2 &&
    readiness.p3 &&
    readiness.p4 &&
    readiness.p5 &&
    readiness.p6 &&
    readiness.p7
  );
}

export function buildGateSummary(readiness: ReadinessReport): GateSummary {
  const priorPass = isAllPriorPhasesReady(readiness);

  const phaseOk: Record<string, boolean> = {
    P1: readiness.p1,
    P2: readiness.p2,
    P3: readiness.p3,
    P4: readiness.p4,
    P5: readiness.p5,
    P6: readiness.p6,
    P7: readiness.p7,
    P8: priorPass,
  };

  const gates: GateSummaryEntry[] = INTELLIGENCE_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: E05_INTELLIGENCE_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `intelligence-gates pass=${passCount}/${gates.length}`,
      `fail=${failCount}`,
      `allPass=${allGatesPass}`,
    ].join(" "),
  };
}

export function getGateSummaryByPhase(
  phase: string,
): GateSummaryEntry | undefined {
  const readiness: ReadinessReport = {
    p1: true,
    p2: true,
    p3: true,
    p4: true,
    p5: true,
    p6: true,
    p7: true,
    ready: true,
    blocked: false,
    summary: "default-ready",
  };
  return buildGateSummary(readiness).gates.find((g) => g.phase === phase);
}
