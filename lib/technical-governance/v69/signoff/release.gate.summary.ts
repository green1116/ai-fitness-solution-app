/**
 * V69 P8 — Release gate summary (declarative, all P1–P8 phases)
 */
import type { ReleaseGateEntry, ReleaseGateSummary, TechnicalPhaseReadiness } from "./signoff.types";
import { V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION } from "./signoff.types";

export const RELEASE_GATE_CATALOG: Omit<ReleaseGateEntry, "ok">[] = [
  {
    id: "TGR-P1",
    phase: "P1",
    label: "Architecture catalog",
    verifyScript: "npm run verify:v69-p1-architecture-catalog",
  },
  {
    id: "TGR-P2",
    phase: "P2",
    label: "Architecture dependency",
    verifyScript: "npm run verify:v69-p2-architecture-dependency",
  },
  {
    id: "TGR-P3",
    phase: "P3",
    label: "Code governance",
    verifyScript: "npm run verify:v69-p3-code-governance",
  },
  {
    id: "TGR-P4",
    phase: "P4",
    label: "Technical standards",
    verifyScript: "npm run verify:v69-p4-technical-standards",
  },
  {
    id: "TGR-P5",
    phase: "P5",
    label: "Security governance",
    verifyScript: "npm run verify:v69-p5-security-governance",
  },
  {
    id: "TGR-P6",
    phase: "P6",
    label: "Quality governance",
    verifyScript: "npm run verify:v69-p6-quality-governance",
  },
  {
    id: "TGR-P7",
    phase: "P7",
    label: "Architecture compliance",
    verifyScript: "npm run verify:v69-p7-architecture-compliance",
  },
  {
    id: "TGR-P8",
    phase: "P8",
    label: "Technical governance sign-off & freeze",
    verifyScript: "npm run verify:v69-p8-technical-governance-signoff",
  },
];

function isAllPriorPhasesReady(readiness: TechnicalPhaseReadiness): boolean {
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

export function buildReleaseGateSummary(readiness: TechnicalPhaseReadiness): ReleaseGateSummary {
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

  const gates: ReleaseGateEntry[] = RELEASE_GATE_CATALOG.map((gate) => ({
    ...gate,
    ok: phaseOk[gate.phase] ?? false,
  }));

  const passCount = gates.filter((g) => g.ok).length;
  const allGatesPass = passCount === gates.length;

  return {
    version: V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
    gateCount: gates.length,
    passCount,
    allGatesPass,
    gates,
    summary: [
      `release-gates pass=${passCount}/${gates.length}`,
      `allPass=${allGatesPass}`,
    ].join(" "),
  };
}

export function getReleaseGateByPhase(phase: string): ReleaseGateEntry | undefined {
  const readiness = {
    p1: true,
    p2: true,
    p3: true,
    p4: true,
    p5: true,
    p6: true,
    p7: true,
  };
  return buildReleaseGateSummary(readiness).gates.find((g) => g.phase === phase);
}
