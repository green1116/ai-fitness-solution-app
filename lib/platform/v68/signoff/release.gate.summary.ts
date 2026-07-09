/**
 * V68 P8 — Release gate summary (declarative, all P1–P8 phases)
 */
import type { PlatformPhaseReadiness, ReleaseGateEntry, ReleaseGateSummary } from "./signoff.types";
import { V68_PLATFORM_SIGNOFF_VERSION } from "./signoff.types";

export const RELEASE_GATE_CATALOG: Omit<ReleaseGateEntry, "ok">[] = [
  {
    id: "RG-P1",
    phase: "P1",
    label: "Service catalog",
    verifyScript: "npm run verify:v68-p1-service-catalog",
  },
  {
    id: "RG-P2",
    phase: "P2",
    label: "Dependency graph",
    verifyScript: "npm run verify:v68-p2-dependency-graph",
  },
  {
    id: "RG-P3",
    phase: "P3",
    label: "Configuration governance",
    verifyScript: "npm run verify:v68-p3-configuration-governance",
  },
  {
    id: "RG-P4",
    phase: "P4",
    label: "Feature flag governance",
    verifyScript: "npm run verify:v68-p4-feature-flag-governance",
  },
  {
    id: "RG-P5",
    phase: "P5",
    label: "Capacity planning",
    verifyScript: "npm run verify:v68-p5-capacity-planning",
  },
  {
    id: "RG-P6",
    phase: "P6",
    label: "Reliability policy",
    verifyScript: "npm run verify:v68-p6-reliability-policy",
  },
  {
    id: "RG-P7",
    phase: "P7",
    label: "Observability policy",
    verifyScript: "npm run verify:v68-p7-observability-policy",
  },
  {
    id: "RG-P8",
    phase: "P8",
    label: "Platform sign-off & freeze",
    verifyScript: "npm run verify:v68-p8-platform-signoff",
  },
];

function isAllPriorPhasesReady(readiness: PlatformPhaseReadiness): boolean {
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

export function buildReleaseGateSummary(readiness: PlatformPhaseReadiness): ReleaseGateSummary {
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
    version: V68_PLATFORM_SIGNOFF_VERSION,
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
