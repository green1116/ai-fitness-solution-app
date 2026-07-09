/**
 * V78 P8 — Execution gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V78_EXECUTION_SIGNOFF_VERSION } from "./signoff.types";

export const EXECUTION_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "EXE-P1",
    phase: "P1",
    label: "Execution inventory",
    verifyScript: "npx tsx scripts/verify-v78-p1-execution-inventory.ts",
  },
  {
    id: "EXE-P2",
    phase: "P2",
    label: "Execution policy",
    verifyScript: "npx tsx scripts/verify-v78-p2-execution-policy-catalog.ts",
  },
  {
    id: "EXE-P3",
    phase: "P3",
    label: "Execution context",
    verifyScript: "npx tsx scripts/verify-v78-p3-execution-context-catalog.ts",
  },
  {
    id: "EXE-P4",
    phase: "P4",
    label: "Execution constraint",
    verifyScript: "npx tsx scripts/verify-v78-p4-execution-constraint-catalog.ts",
  },
  {
    id: "EXE-P5",
    phase: "P5",
    label: "Execution evaluation",
    verifyScript: "npx tsx scripts/verify-v78-p5-execution-evaluation-catalog.ts",
  },
  {
    id: "EXE-P6",
    phase: "P6",
    label: "Execution simulation",
    verifyScript: "npx tsx scripts/verify-v78-p6-execution-simulation-catalog.ts",
  },
  {
    id: "EXE-P7",
    phase: "P7",
    label: "Execution compliance",
    verifyScript: "npx tsx scripts/verify-v78-p7-execution-compliance-catalog.ts",
  },
  {
    id: "EXE-P8",
    phase: "P8",
    label: "Execution sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v78-p8-execution-signoff.ts",
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

  const gates: GateSummaryEntry[] = EXECUTION_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V78_EXECUTION_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `execution-gates pass=${passCount}/${gates.length}`,
      `fail=${failCount}`,
      `allPass=${allGatesPass}`,
    ].join(" "),
  };
}

export function getGateSummaryByPhase(phase: string): GateSummaryEntry | undefined {
  const readiness = {
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
