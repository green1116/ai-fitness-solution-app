/**
 * E08-P8 — Ecosystem gate summary (declarative, all P1–P8 phases)
 */

import type {
  GateSummary,
  GateSummaryEntry,
  ReadinessReport,
} from "./signoff.types";
import { E08_ECOSYSTEM_SIGNOFF_VERSION } from "./signoff.types";

export const ECOSYSTEM_GATE_CATALOG: Omit<
  GateSummaryEntry,
  "ok" | "state"
>[] = [
  {
    id: "EE-P1",
    phase: "P1",
    label: "Enterprise Ecosystem Foundation",
    verifyScript:
      "npx tsx scripts/verify-e08-p1-enterprise-ecosystem-foundation.ts",
  },
  {
    id: "EE-P2",
    phase: "P2",
    label: "Multi Organization Network",
    verifyScript:
      "npx tsx scripts/verify-e08-p2-multi-organization-network.ts",
  },
  {
    id: "EE-P3",
    phase: "P3",
    label: "AI Partner Exchange",
    verifyScript: "npx tsx scripts/verify-e08-p3-ai-partner-exchange.ts",
  },
  {
    id: "EE-P4",
    phase: "P4",
    label: "Cross Enterprise Workflow",
    verifyScript:
      "npx tsx scripts/verify-e08-p4-cross-enterprise-workflow.ts",
  },
  {
    id: "EE-P5",
    phase: "P5",
    label: "Ecosystem Intelligence",
    verifyScript: "npx tsx scripts/verify-e08-p5-ecosystem-intelligence.ts",
  },
  {
    id: "EE-P6",
    phase: "P6",
    label: "Autonomous Market Agent",
    verifyScript: "npx tsx scripts/verify-e08-p6-autonomous-market-agent.ts",
  },
  {
    id: "EE-P7",
    phase: "P7",
    label: "Enterprise Network OS",
    verifyScript: "npx tsx scripts/verify-e08-p7-enterprise-network-os.ts",
  },
  {
    id: "EE-P8",
    phase: "P8",
    label: "Autonomous Enterprise Ecosystem Governance Freeze",
    verifyScript: "npx tsx scripts/verify-e08-p8-ecosystem-governance.ts",
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

  const gates: GateSummaryEntry[] = ECOSYSTEM_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: E08_ECOSYSTEM_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `ecosystem-gates pass=${passCount}/${gates.length}`,
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
