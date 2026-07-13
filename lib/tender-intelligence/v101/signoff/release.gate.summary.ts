/**
 * E01-P8 — Tender Intelligence gate summary (declarative, all P1–P8 phases)
 */

import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V101_TENDER_SIGNOFF_VERSION } from "./signoff.types";

export const TENDER_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "TI-P1",
    phase: "P1",
    label: "Tender Intake",
    verifyScript: "npx tsx scripts/verify-v101-p1-tender-intake.ts",
  },
  {
    id: "TI-P2",
    phase: "P2",
    label: "Document Understanding",
    verifyScript: "npx tsx scripts/verify-v101-p2-understanding.ts",
  },
  {
    id: "TI-P3",
    phase: "P3",
    label: "Tender Intelligence",
    verifyScript: "npx tsx scripts/verify-v101-p3-intelligence.ts",
  },
  {
    id: "TI-P4",
    phase: "P4",
    label: "Bid Strategy",
    verifyScript: "npx tsx scripts/verify-v101-p4-strategy.ts",
  },
  {
    id: "TI-P5",
    phase: "P5",
    label: "Proposal Intelligence",
    verifyScript: "npx tsx scripts/verify-v101-p5-proposal.ts",
  },
  {
    id: "TI-P6",
    phase: "P6",
    label: "Agent Orchestration",
    verifyScript: "npx tsx scripts/verify-v101-p6-agent.ts",
  },
  {
    id: "TI-P7",
    phase: "P7",
    label: "Enterprise Delivery",
    verifyScript: "npx tsx scripts/verify-v101-p7-delivery.ts",
  },
  {
    id: "TI-P8",
    phase: "P8",
    label: "Sign-off & Freeze",
    verifyScript: "npx tsx scripts/verify-v101-p8-signoff.ts",
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

  const gates: GateSummaryEntry[] = TENDER_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V101_TENDER_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `tender-gates pass=${passCount}/${gates.length}`,
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
