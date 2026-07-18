/**
 * E07-P8 — Workforce gate summary (declarative, all P1–P8 phases)
 */

import type {
  GateSummary,
  GateSummaryEntry,
  ReadinessReport,
} from "./signoff.types";
import { E07_WORKFORCE_SIGNOFF_VERSION } from "./signoff.types";

export const WORKFORCE_GATE_CATALOG: Omit<
  GateSummaryEntry,
  "ok" | "state"
>[] = [
  {
    id: "DW-P1",
    phase: "P1",
    label: "Digital Workforce Foundation",
    verifyScript:
      "npx tsx scripts/verify-e07-p1-digital-workforce-foundation.ts",
  },
  {
    id: "DW-P2",
    phase: "P2",
    label: "AI Employee Runtime",
    verifyScript: "npx tsx scripts/verify-e07-p2-ai-employee-runtime.ts",
  },
  {
    id: "DW-P3",
    phase: "P3",
    label: "Role Agent Marketplace",
    verifyScript: "npx tsx scripts/verify-e07-p3-role-agent-marketplace.ts",
  },
  {
    id: "DW-P4",
    phase: "P4",
    label: "Workforce Orchestration",
    verifyScript: "npx tsx scripts/verify-e07-p4-workforce-orchestration.ts",
  },
  {
    id: "DW-P5",
    phase: "P5",
    label: "Human-AI Collaboration",
    verifyScript: "npx tsx scripts/verify-e07-p5-human-ai-collaboration.ts",
  },
  {
    id: "DW-P6",
    phase: "P6",
    label: "Workforce Learning Loop",
    verifyScript: "npx tsx scripts/verify-e07-p6-workforce-learning-loop.ts",
  },
  {
    id: "DW-P7",
    phase: "P7",
    label: "Autonomous Organization",
    verifyScript: "npx tsx scripts/verify-e07-p7-autonomous-organization.ts",
  },
  {
    id: "DW-P8",
    phase: "P8",
    label: "Digital Workforce Governance Freeze",
    verifyScript:
      "npx tsx scripts/verify-e07-p8-digital-workforce-governance.ts",
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

  const gates: GateSummaryEntry[] = WORKFORCE_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: E07_WORKFORCE_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `workforce-gates pass=${passCount}/${gates.length}`,
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
