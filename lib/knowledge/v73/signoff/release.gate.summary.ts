/**
 * V73 P8 — Knowledge gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V73_KNOWLEDGE_SIGNOFF_VERSION } from "./signoff.types";

export const KNOWLEDGE_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "KNW-GWR-P1",
    phase: "P1",
    label: "Knowledge catalog",
    verifyScript: "npx tsx scripts/verify-v73-p1-knowledge-catalog.ts",
  },
  {
    id: "KNW-GWR-P2",
    phase: "P2",
    label: "Knowledge dependency",
    verifyScript: "npx tsx scripts/verify-v73-p2-knowledge-dependency.ts",
  },
  {
    id: "KNW-GWR-P3",
    phase: "P3",
    label: "Knowledge policy",
    verifyScript: "npx tsx scripts/verify-v73-p3-knowledge-policy.ts",
  },
  {
    id: "KNW-GWR-P4",
    phase: "P4",
    label: "Knowledge compatibility",
    verifyScript: "npx tsx scripts/verify-v73-p4-knowledge-compatibility.ts",
  },
  {
    id: "KNW-GWR-P5",
    phase: "P5",
    label: "Knowledge governance",
    verifyScript: "npx tsx scripts/verify-v73-p5-knowledge-governance.ts",
  },
  {
    id: "KNW-GWR-P6",
    phase: "P6",
    label: "Knowledge lifecycle",
    verifyScript: "npx tsx scripts/verify-v73-p6-knowledge-lifecycle.ts",
  },
  {
    id: "KNW-GWR-P7",
    phase: "P7",
    label: "Knowledge compliance",
    verifyScript: "npx tsx scripts/verify-v73-p7-knowledge-compliance.ts",
  },
  {
    id: "KNW-GWR-P8",
    phase: "P8",
    label: "Knowledge sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v73-p8-knowledge-signoff.ts",
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

  const gates: GateSummaryEntry[] = KNOWLEDGE_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V73_KNOWLEDGE_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `knowledge-gates pass=${passCount}/${gates.length}`,
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
