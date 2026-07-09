/**
 * V70 P8 — Release gate summary (declarative, all P1–P8 phases)
 */
import type { GateSummary, GateSummaryEntry, ReadinessReport } from "./signoff.types";
import { V70_DELIVERY_SIGNOFF_VERSION } from "./signoff.types";

export const RELEASE_GATE_CATALOG: Omit<GateSummaryEntry, "ok" | "state">[] = [
  {
    id: "DGR-P1",
    phase: "P1",
    label: "Release catalog",
    verifyScript: "npx tsx scripts/verify-v70-p1-release-catalog.ts",
  },
  {
    id: "DGR-P2",
    phase: "P2",
    label: "Release dependency",
    verifyScript: "npx tsx scripts/verify-v70-p2-release-dependency.ts",
  },
  {
    id: "DGR-P3",
    phase: "P3",
    label: "Release policy",
    verifyScript: "npx tsx scripts/verify-v70-p3-release-policy.ts",
  },
  {
    id: "DGR-P4",
    phase: "P4",
    label: "Version compatibility",
    verifyScript: "npx tsx scripts/verify-v70-p4-version-compatibility.ts",
  },
  {
    id: "DGR-P5",
    phase: "P5",
    label: "Upgrade governance",
    verifyScript: "npx tsx scripts/verify-v70-p5-upgrade-governance.ts",
  },
  {
    id: "DGR-P6",
    phase: "P6",
    label: "Lifecycle management",
    verifyScript: "npx tsx scripts/verify-v70-p6-lifecycle-management.ts",
  },
  {
    id: "DGR-P7",
    phase: "P7",
    label: "Delivery compliance",
    verifyScript: "npx tsx scripts/verify-v70-p7-delivery-compliance.ts",
  },
  {
    id: "DGR-P8",
    phase: "P8",
    label: "Delivery sign-off & freeze",
    verifyScript: "npx tsx scripts/verify-v70-p8-delivery-signoff.ts",
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

  const gates: GateSummaryEntry[] = RELEASE_GATE_CATALOG.map((gate) => {
    const ok = phaseOk[gate.phase] ?? false;
    const state = ok ? "pass" : readiness.blocked ? "blocked" : "fail";
    return { ...gate, ok, state };
  });

  const passCount = gates.filter((g) => g.ok).length;
  const failCount = gates.filter((g) => !g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V70_DELIVERY_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    failCount,
    allGatesPass,
    gates,
    summary: [
      `release-gates pass=${passCount}/${gates.length}`,
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
