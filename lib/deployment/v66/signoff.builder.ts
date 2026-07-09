/**
 * V66 P8 — Deployment sign-off report builder (read-only)
 */
import { buildDeploymentFreezeManifest } from "./freeze.manifest";
import { buildReleaseGateSummary } from "./release.gate.summary";
import { formatDeploymentClosingSummary } from "./signoff.summary";
import type {
  DeploymentSignoffPhase,
  DeploymentSignoffReport,
  DeploymentSignoffSignals,
} from "./signoff.types";
import { V66_DEPLOYMENT_SIGNOFF_VERSION } from "./signoff.types";

function collectPhases(freeze: ReturnType<typeof buildDeploymentFreezeManifest>): DeploymentSignoffPhase[] {
  const ops = freeze.ops;
  return [
    { id: "P1", label: "Deployment baseline", ok: ops.drReady },
    { id: "P2", label: "Execution & health", ok: ops.drReady },
    { id: "P3", label: "Observability", ok: ops.drReady },
    { id: "P4", label: "Release orchestration", ok: ops.drReady },
    { id: "P5", label: "Security & compliance", ok: ops.drReady },
    { id: "P6", label: "Disaster recovery", ok: ops.drReady },
    { id: "P7", label: "Ops automation", ok: ops.opsReady },
    { id: "P8", label: "Sign-off & freeze", ok: freeze.frozen },
  ];
}

export function buildDeploymentSignoffReport(input?: {
  deploymentId?: string;
  signals?: DeploymentSignoffSignals;
}): DeploymentSignoffReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-signoff-default";
  const freeze = buildDeploymentFreezeManifest({ deploymentId, signals: input?.signals });

  const phases = collectPhases(freeze);
  const releaseGates = buildReleaseGateSummary(freeze.ops);
  const allPhasesPass = phases.every((p) => p.ok);
  const signedOff = freeze.frozen && allPhasesPass && releaseGates.allGatesPass;

  const closingSummary = formatDeploymentClosingSummary({
    phases,
    signedOff,
    readinessScore: freeze.ops.readinessScore,
  });

  return {
    version: V66_DEPLOYMENT_SIGNOFF_VERSION,
    signoffId: `deployment-signoff-${deploymentId}`,
    signedOffAt: new Date().toISOString(),
    deploymentId,
    phases,
    releaseGates,
    freeze,
    finalReadinessScore: signedOff ? 100 : freeze.ops.readinessScore,
    allPhasesPass,
    signedOff,
    closingSummary,
    summary: [
      `deployment-signoff signedOff=${signedOff}`,
      `phases=${phases.filter((p) => p.ok).length}/${phases.length}`,
      `freeze=${freeze.frozen}`,
    ].join(" "),
  };
}

export function assertDeploymentSignoffPass(
  report: DeploymentSignoffReport,
): asserts report is DeploymentSignoffReport & { signedOff: true } {
  if (!report.signedOff) {
    throw new Error(`V66 deployment sign-off not complete: ${report.summary}`);
  }
}
