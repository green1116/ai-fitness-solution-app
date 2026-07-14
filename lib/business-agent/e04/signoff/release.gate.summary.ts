/**
 * E04-P8 — Business Agent gate summary (declarative, all P1–P8 phases)
 */

import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { E04_BUSINESS_AGENT_SIGNOFF_VERSION } from "./signoff.types";

export const BUSINESS_AGENT_GATE_CATALOG: Omit<
  GateSummaryEntry,
  "ok" | "state"
>[] = [
  {
    id: "BA-P1",
    phase: "P1",
    label: "Business Agent Foundation",
    verifyScript: "npx tsx scripts/verify-e04-p1-business-agent-foundation.ts",
  },
  {
    id: "BA-P2",
    phase: "P2",
    label: "Business Workflow Runtime",
    verifyScript: "npx tsx scripts/verify-e04-p2-business-workflow-runtime.ts",
  },
  {
    id: "BA-P3",
    phase: "P3",
    label: "Business Process Orchestration",
    verifyScript:
      "npx tsx scripts/verify-e04-p3-business-process-orchestration.ts",
  },
  {
    id: "BA-P4",
    phase: "P4",
    label: "Business Decision Runtime",
    verifyScript: "npx tsx scripts/verify-e04-p4-business-decision-runtime.ts",
  },
  {
    id: "BA-P5",
    phase: "P5",
    label: "Business Memory Runtime",
    verifyScript: "npx tsx scripts/verify-e04-p5-business-memory-runtime.ts",
  },
  {
    id: "BA-P6",
    phase: "P6",
    label: "Business Knowledge Runtime",
    verifyScript: "npx tsx scripts/verify-e04-p6-business-knowledge-runtime.ts",
  },
  {
    id: "BA-P7",
    phase: "P7",
    label: "Enterprise Agent Collaboration",
    verifyScript:
      "npx tsx scripts/verify-e04-p7-enterprise-agent-collaboration.ts",
  },
  {
    id: "BA-P8",
    phase: "P8",
    label: "Governance Freeze",
    verifyScript: "npx tsx scripts/verify-e04-p8-business-agent-governance.ts",
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

  const gates: GateSummaryEntry[] = BUSINESS_AGENT_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: E04_BUSINESS_AGENT_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `business-agent-gates pass=${passCount}/${gates.length}`,
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
