/**
 * V71 P8 — Workflow gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V71_WORKFLOW_SIGNOFF_VERSION } from "./signoff.types";

export const WORKFLOW_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "ORC-GWR-P1",
    phase: "P1",
    label: "Orchestration catalog",
    verifyScript: "npx tsx scripts/verify-v71-p1-orchestration-catalog.ts",
  },
  {
    id: "ORC-GWR-P2",
    phase: "P2",
    label: "Workflow dependency",
    verifyScript: "npx tsx scripts/verify-v71-p2-workflow-dependency.ts",
  },
  {
    id: "ORC-GWR-P3",
    phase: "P3",
    label: "Workflow policy",
    verifyScript: "npx tsx scripts/verify-v71-p3-workflow-policy.ts",
  },
  {
    id: "ORC-GWR-P4",
    phase: "P4",
    label: "Workflow compatibility",
    verifyScript: "npx tsx scripts/verify-v71-p4-workflow-compatibility.ts",
  },
  {
    id: "ORC-GWR-P5",
    phase: "P5",
    label: "Workflow governance",
    verifyScript: "npx tsx scripts/verify-v71-p5-workflow-governance.ts",
  },
  {
    id: "ORC-GWR-P6",
    phase: "P6",
    label: "Workflow lifecycle",
    verifyScript: "npx tsx scripts/verify-v71-p6-workflow-lifecycle.ts",
  },
  {
    id: "ORC-GWR-P7",
    phase: "P7",
    label: "Workflow compliance",
    verifyScript: "npx tsx scripts/verify-v71-p7-workflow-compliance.ts",
  },
  {
    id: "ORC-GWR-P8",
    phase: "P8",
    label: "Workflow sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v71-p8-workflow-signoff.ts",
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

  const gates: GateSummaryEntry[] = WORKFLOW_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V71_WORKFLOW_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `workflow-gates pass=${passCount}/${gates.length}`,
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
