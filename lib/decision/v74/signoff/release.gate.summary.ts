/**
 * V74 P8 — Decision gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V74_DECISION_SIGNOFF_VERSION } from "./signoff.types";

export const DECISION_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "DG-P1",
    phase: "P1",
    label: "Decision inventory",
    verifyScript: "npx tsx scripts/verify-v74-p1-decision-inventory.ts",
  },
  {
    id: "DG-P2",
    phase: "P2",
    label: "Decision policy",
    verifyScript: "npx tsx scripts/verify-v74-p2-decision-policy-catalog.ts",
  },
  {
    id: "DG-P3",
    phase: "P3",
    label: "Decision context",
    verifyScript: "npx tsx scripts/verify-v74-p3-decision-context.ts",
  },
  {
    id: "DG-P4",
    phase: "P4",
    label: "Decision constraint",
    verifyScript: "npx tsx scripts/verify-v74-p4-decision-constraint.ts",
  },
  {
    id: "DG-P5",
    phase: "P5",
    label: "Decision evaluation",
    verifyScript: "npx tsx scripts/verify-v74-p5-decision-evaluation.ts",
  },
  {
    id: "DG-P6",
    phase: "P6",
    label: "Decision simulation",
    verifyScript: "npx tsx scripts/verify-v74-p6-decision-simulation.ts",
  },
  {
    id: "DG-P7",
    phase: "P7",
    label: "Decision compliance",
    verifyScript: "npx tsx scripts/verify-v74-p7-decision-compliance.ts",
  },
  {
    id: "DG-P8",
    phase: "P8",
    label: "Decision sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v74-p8-decision-signoff.ts",
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

  const gates: GateSummaryEntry[] = DECISION_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V74_DECISION_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `decision-gates pass=${passCount}/${gates.length}`,
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
