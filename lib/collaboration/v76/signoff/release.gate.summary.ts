/**
 * V76 P8 — Collaboration gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V76_COLLABORATION_SIGNOFF_VERSION } from "./signoff.types";

export const COLLABORATION_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "COL-P1",
    phase: "P1",
    label: "Collaboration inventory",
    verifyScript: "npx tsx scripts/verify-v76-p1-collaboration-inventory.ts",
  },
  {
    id: "COL-P2",
    phase: "P2",
    label: "Collaboration policy",
    verifyScript: "npx tsx scripts/verify-v76-p2-collaboration-policy-catalog.ts",
  },
  {
    id: "COL-P3",
    phase: "P3",
    label: "Collaboration context",
    verifyScript: "npx tsx scripts/verify-v76-p3-collaboration-context-catalog.ts",
  },
  {
    id: "COL-P4",
    phase: "P4",
    label: "Collaboration constraint",
    verifyScript: "npx tsx scripts/verify-v76-p4-collaboration-constraint-catalog.ts",
  },
  {
    id: "COL-P5",
    phase: "P5",
    label: "Collaboration evaluation",
    verifyScript: "npx tsx scripts/verify-v76-p5-collaboration-evaluation-catalog.ts",
  },
  {
    id: "COL-P6",
    phase: "P6",
    label: "Collaboration simulation",
    verifyScript: "npx tsx scripts/verify-v76-p6-collaboration-simulation-catalog.ts",
  },
  {
    id: "COL-P7",
    phase: "P7",
    label: "Collaboration compliance",
    verifyScript: "npx tsx scripts/verify-v76-p7-collaboration-compliance-catalog.ts",
  },
  {
    id: "COL-P8",
    phase: "P8",
    label: "Collaboration sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v76-p8-collaboration-signoff.ts",
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

  const gates: GateSummaryEntry[] = COLLABORATION_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V76_COLLABORATION_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `collaboration-gates pass=${passCount}/${gates.length}`,
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
