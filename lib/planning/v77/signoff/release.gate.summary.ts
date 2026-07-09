/**
 * V77 P8 — Planning gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V77_PLANNING_SIGNOFF_VERSION } from "./signoff.types";

export const PLANNING_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "PLN-P1",
    phase: "P1",
    label: "Planning inventory",
    verifyScript: "npx tsx scripts/verify-v77-p1-planning-inventory.ts",
  },
  {
    id: "PLN-P2",
    phase: "P2",
    label: "Planning policy",
    verifyScript: "npx tsx scripts/verify-v77-p2-planning-policy-catalog.ts",
  },
  {
    id: "PLN-P3",
    phase: "P3",
    label: "Planning context",
    verifyScript: "npx tsx scripts/verify-v77-p3-planning-context-catalog.ts",
  },
  {
    id: "PLN-P4",
    phase: "P4",
    label: "Planning constraint",
    verifyScript: "npx tsx scripts/verify-v77-p4-planning-constraint-catalog.ts",
  },
  {
    id: "PLN-P5",
    phase: "P5",
    label: "Planning evaluation",
    verifyScript: "npx tsx scripts/verify-v77-p5-planning-evaluation-catalog.ts",
  },
  {
    id: "PLN-P6",
    phase: "P6",
    label: "Planning simulation",
    verifyScript: "npx tsx scripts/verify-v77-p6-planning-simulation-catalog.ts",
  },
  {
    id: "PLN-P7",
    phase: "P7",
    label: "Planning compliance",
    verifyScript: "npx tsx scripts/verify-v77-p7-planning-compliance-catalog.ts",
  },
  {
    id: "PLN-P8",
    phase: "P8",
    label: "Planning sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v77-p8-planning-signoff.ts",
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

  const gates: GateSummaryEntry[] = PLANNING_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V77_PLANNING_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `planning-gates pass=${passCount}/${gates.length}`,
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
