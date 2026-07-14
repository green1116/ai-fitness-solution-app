/**
 * E02-P8 — Knowledge Graph gate summary (declarative, all P1–P8 phases)
 */

import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V102_KNOWLEDGE_SIGNOFF_VERSION } from "./signoff.types";

export const KNOWLEDGE_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "KG-P1",
    phase: "P1",
    label: "Knowledge Graph Kernel",
    verifyScript: "npx tsx scripts/verify-v102-p1-knowledge.ts",
  },
  {
    id: "KG-P2",
    phase: "P2",
    label: "Entity Extraction",
    verifyScript: "npx tsx scripts/verify-v102-p2-extraction.ts",
  },
  {
    id: "KG-P3",
    phase: "P3",
    label: "Relationship Engine",
    verifyScript: "npx tsx scripts/verify-v102-p3-relationship.ts",
  },
  {
    id: "KG-P4",
    phase: "P4",
    label: "Knowledge Retrieval",
    verifyScript: "npx tsx scripts/verify-v102-p4-retrieval.ts",
  },
  {
    id: "KG-P5",
    phase: "P5",
    label: "Similar Tender Intelligence",
    verifyScript: "npx tsx scripts/verify-v102-p5-similarity.ts",
  },
  {
    id: "KG-P6",
    phase: "P6",
    label: "Enterprise Memory Agent",
    verifyScript: "npx tsx scripts/verify-v102-p6-memory-agent.ts",
  },
  {
    id: "KG-P7",
    phase: "P7",
    label: "Knowledge Delivery",
    verifyScript: "npx tsx scripts/verify-v102-p7-delivery.ts",
  },
  {
    id: "KG-P8",
    phase: "P8",
    label: "Sign-off & Freeze",
    verifyScript: "npx tsx scripts/verify-v102-p8-signoff.ts",
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
    version: V102_KNOWLEDGE_SIGNOFF_VERSION,
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
