/**
 * V66 P8 — Release gate summary (declarative, all P1–P8 phases)
 */
import type { DeploymentOpsReport } from "./ops.types";
import type { ReleaseGateEntry, ReleaseGateSummary } from "./signoff.types";
import { V66_DEPLOYMENT_SIGNOFF_VERSION } from "./signoff.types";

export const RELEASE_GATE_CATALOG: Omit<ReleaseGateEntry, "ok">[] = [
  {
    id: "RG-P1",
    phase: "P1",
    label: "Deployment baseline & env contract",
    verifyScript: "npm run verify:v66-p1-deployment-baseline",
  },
  {
    id: "RG-P2",
    phase: "P2",
    label: "Execution & health checks",
    verifyScript: "npm run verify:v66-p2-deployment-execution",
  },
  {
    id: "RG-P3",
    phase: "P3",
    label: "Observability baseline",
    verifyScript: "npm run verify:v66-p3-deployment-observability",
  },
  {
    id: "RG-P4",
    phase: "P4",
    label: "Release orchestration & rollback guard",
    verifyScript: "npm run verify:v66-p4-release-orchestration",
  },
  {
    id: "RG-P5",
    phase: "P5",
    label: "Security & compliance",
    verifyScript: "npm run verify:v66-p5-deployment-security",
  },
  {
    id: "RG-P6",
    phase: "P6",
    label: "Backup & disaster recovery",
    verifyScript: "npm run verify:v66-p6-disaster-recovery",
  },
  {
    id: "RG-P7",
    phase: "P7",
    label: "Automation & ops runbook",
    verifyScript: "npm run verify:v66-p7-deployment-ops",
  },
  {
    id: "RG-P8",
    phase: "P8",
    label: "Sign-off & freeze",
    verifyScript: "npm run verify:v66-p8-deployment-signoff",
  },
];

export function buildReleaseGateSummary(ops: DeploymentOpsReport): ReleaseGateSummary {
  const gates: ReleaseGateEntry[] = RELEASE_GATE_CATALOG.map((gate) => ({
    ...gate,
    ok: ops.opsReady,
  }));

  const passCount = gates.filter((g) => g.ok).length;
  const allGatesPass = ops.opsReady && passCount === gates.length;

  return {
    version: V66_DEPLOYMENT_SIGNOFF_VERSION,
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
