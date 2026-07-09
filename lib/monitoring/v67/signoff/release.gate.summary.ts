/**
 * V67 P8 — Release gate summary (declarative, all P1–P8 phases)
 */
import type { MonitoringPhaseReadiness, ReleaseGateEntry, ReleaseGateSummary } from "./signoff.types";
import { V67_MONITORING_SIGNOFF_VERSION } from "./signoff.types";

export const RELEASE_GATE_CATALOG: Omit<ReleaseGateEntry, "ok">[] = [
  {
    id: "RG-P1",
    phase: "P1",
    label: "Monitoring & incident response foundation",
    verifyScript: "npm run verify:v67-p1-monitoring-foundation",
  },
  {
    id: "RG-P2",
    phase: "P2",
    label: "Incident lifecycle & state machine",
    verifyScript: "npm run verify:v67-p2-incident-lifecycle",
  },
  {
    id: "RG-P3",
    phase: "P3",
    label: "Alert taxonomy & governance",
    verifyScript: "npm run verify:v67-p3-alert-taxonomy",
  },
  {
    id: "RG-P4",
    phase: "P4",
    label: "SLO/SLI governance",
    verifyScript: "npm run verify:v67-p4-slo-governance",
  },
  {
    id: "RG-P5",
    phase: "P5",
    label: "On-call & escalation governance",
    verifyScript: "npm run verify:v67-p5-oncall-governance",
  },
  {
    id: "RG-P6",
    phase: "P6",
    label: "Observability dashboard contracts",
    verifyScript: "npm run verify:v67-p6-observability-dashboard",
  },
  {
    id: "RG-P7",
    phase: "P7",
    label: "Incident report & postmortem foundation",
    verifyScript: "npm run verify:v67-p7-postmortem-foundation",
  },
  {
    id: "RG-P8",
    phase: "P8",
    label: "Sign-off & freeze",
    verifyScript: "npm run verify:v67-p8-monitoring-signoff",
  },
];

function isAllPriorPhasesReady(readiness: MonitoringPhaseReadiness): boolean {
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

export function buildReleaseGateSummary(readiness: MonitoringPhaseReadiness): ReleaseGateSummary {
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
    version: V67_MONITORING_SIGNOFF_VERSION,
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
