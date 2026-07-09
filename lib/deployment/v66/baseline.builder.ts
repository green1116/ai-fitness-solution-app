/**
 * V66 P1 — Deployment baseline report builder (read-only)
 */
import { V66_UPSTREAM_FROZEN_LAYER_LOCK, isUpstreamFrozenLayerLockIntact } from "./baseline.lock";
import type {
  DeploymentBaselineReport,
  DeploymentBaselineSignals,
  DeploymentTarget,
} from "./baseline.types";
import { V66_DEPLOYMENT_BASELINE_VERSION } from "./baseline.types";
import { buildDeploymentChecklist, scoreDeploymentChecklist } from "./deployment.checklist";
import { buildEnvContractManifest } from "./env.contract";
import { buildRuntimeConfigSurfaceManifest } from "./runtime.surface";

const DEFAULT_SIGNALS: DeploymentBaselineSignals = {
  v65ProductionClosed: true,
  envContractComplete: true,
  requiredSecretsConfigured: true,
  forbiddenFlagsClear: true,
  runtimeSurfaceComplete: true,
  verifyChainPass: true,
};

export function buildDeploymentBaselineReport(input?: {
  deploymentId?: string;
  targetEnvironment?: DeploymentTarget;
  signals?: DeploymentBaselineSignals;
}): DeploymentBaselineReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-baseline-default";
  const targetEnvironment = input?.targetEnvironment ?? "production";
  const signals = { ...DEFAULT_SIGNALS, ...input?.signals };

  const envContract = buildEnvContractManifest();
  const runtimeConfigSurface = buildRuntimeConfigSurfaceManifest();
  const deploymentChecklist = buildDeploymentChecklist({
    ...signals,
    envContractComplete: envContract.contractComplete,
    runtimeSurfaceComplete: runtimeConfigSurface.surfaceComplete,
  });
  const checklistScore = scoreDeploymentChecklist(deploymentChecklist);

  const upstreamFrozenIntact = isUpstreamFrozenLayerLockIntact();
  const contractComplete =
    envContract.contractComplete && runtimeConfigSurface.surfaceComplete && upstreamFrozenIntact;
  const deploymentReady = contractComplete && checklistScore.requiredPass;

  return {
    version: V66_DEPLOYMENT_BASELINE_VERSION,
    reportId: `deployment-baseline-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    targetEnvironment,
    upstreamFrozen: V66_UPSTREAM_FROZEN_LAYER_LOCK,
    upstreamFrozenIntact,
    envContract,
    deploymentChecklist,
    runtimeConfigSurface,
    checklistPassCount: checklistScore.passCount,
    checklistRequiredCount: checklistScore.requiredCount,
    contractComplete,
    deploymentReady,
    readinessScore: deploymentReady ? 100 : checklistScore.score,
    summary: [
      `deployment-baseline ready=${deploymentReady}`,
      `env=${envContract.variableCount}vars`,
      `checklist=${checklistScore.passCount}/${deploymentChecklist.length}`,
      `upstream=${upstreamFrozenIntact}`,
    ].join(" "),
  };
}

export function assertDeploymentBaselinePass(
  report: DeploymentBaselineReport,
): asserts report is DeploymentBaselineReport & { deploymentReady: true } {
  if (!report.deploymentReady) {
    throw new Error(`V66 deployment baseline not ready: ${report.summary}`);
  }
}
