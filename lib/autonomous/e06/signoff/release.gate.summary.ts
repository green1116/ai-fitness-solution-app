/**
 * E06-P8 — Autonomous gate summary (declarative, all P1–P8 phases)
 */

import type {
  GateSummary,
  GateSummaryEntry,
  ReadinessReport,
} from "./signoff.types";
import { E06_AUTONOMOUS_SIGNOFF_VERSION } from "./signoff.types";

export const AUTONOMOUS_GATE_CATALOG: Omit<
  GateSummaryEntry,
  "ok" | "state"
>[] = [
  {
    id: "EA-P1",
    phase: "P1",
    label: "Autonomous Operation Foundation",
    verifyScript:
      "npx tsx scripts/verify-e06-p1-autonomous-operation-foundation.ts",
  },
  {
    id: "EA-P2",
    phase: "P2",
    label: "Business Action Runtime",
    verifyScript: "npx tsx scripts/verify-e06-p2-business-action-runtime.ts",
  },
  {
    id: "EA-P3",
    phase: "P3",
    label: "Autonomous Workflow Agent",
    verifyScript: "npx tsx scripts/verify-e06-p3-autonomous-workflow-agent.ts",
  },
  {
    id: "EA-P4",
    phase: "P4",
    label: "Enterprise Control Plane",
    verifyScript: "npx tsx scripts/verify-e06-p4-enterprise-control-plane.ts",
  },
  {
    id: "EA-P5",
    phase: "P5",
    label: "Self Optimization Loop",
    verifyScript: "npx tsx scripts/verify-e06-p5-self-optimization-loop.ts",
  },
  {
    id: "EA-P6",
    phase: "P6",
    label: "Enterprise Digital Twin",
    verifyScript: "npx tsx scripts/verify-e06-p6-enterprise-digital-twin.ts",
  },
  {
    id: "EA-P7",
    phase: "P7",
    label: "Autonomous Enterprise Agent",
    verifyScript:
      "npx tsx scripts/verify-e06-p7-autonomous-enterprise-agent.ts",
  },
  {
    id: "EA-P8",
    phase: "P8",
    label: "Autonomous Enterprise OS Governance Freeze",
    verifyScript:
      "npx tsx scripts/verify-e06-p8-autonomous-enterprise-governance.ts",
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

  const gates: GateSummaryEntry[] = AUTONOMOUS_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: E06_AUTONOMOUS_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `autonomous-gates pass=${passCount}/${gates.length}`,
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
