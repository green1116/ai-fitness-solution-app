/**
 * V79 P8 — Task gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V79_TASK_SIGNOFF_VERSION } from "./signoff.types";

export const TASK_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "TSK-P1",
    phase: "P1",
    label: "Task inventory",
    verifyScript: "npx tsx scripts/verify-v79-p1-task-inventory.ts",
  },
  {
    id: "TSK-P2",
    phase: "P2",
    label: "Task policy",
    verifyScript: "npx tsx scripts/verify-v79-p2-task-policy-catalog.ts",
  },
  {
    id: "TSK-P3",
    phase: "P3",
    label: "Task context",
    verifyScript: "npx tsx scripts/verify-v79-p3-task-context-catalog.ts",
  },
  {
    id: "TSK-P4",
    phase: "P4",
    label: "Task constraint",
    verifyScript: "npx tsx scripts/verify-v79-p4-task-constraint-catalog.ts",
  },
  {
    id: "TSK-P5",
    phase: "P5",
    label: "Task evaluation",
    verifyScript: "npx tsx scripts/verify-v79-p5-task-evaluation-catalog.ts",
  },
  {
    id: "TSK-P6",
    phase: "P6",
    label: "Task simulation",
    verifyScript: "npx tsx scripts/verify-v79-p6-task-simulation-catalog.ts",
  },
  {
    id: "TSK-P7",
    phase: "P7",
    label: "Task compliance",
    verifyScript: "npx tsx scripts/verify-v79-p7-task-compliance-catalog.ts",
  },
  {
    id: "TSK-P8",
    phase: "P8",
    label: "Task sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v79-p8-task-signoff.ts",
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

  const gates: GateSummaryEntry[] = TASK_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V79_TASK_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `task-gates pass=${passCount}/${gates.length}`,
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
