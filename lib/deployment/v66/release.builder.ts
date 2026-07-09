/**
 * V66 P4 — Release orchestration report builder (read-only)
 */
import { buildDeploymentObservabilityReport } from "./observability.builder";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";
import { buildReleaseManifest } from "./release.manifest";
import type { ReleaseOrchestrationReport, ReleaseOrchestrationSignals } from "./release.types";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";
import { buildRollbackGuardManifest } from "./rollback.guard";
import { buildRolloutStageManifest } from "./rollout.stages";

const DEFAULT_SIGNALS: ReleaseOrchestrationSignals = {
  observabilityReady: true,
  manifestComplete: true,
  rolloutStagesComplete: true,
  rollbackGuardIntact: true,
};

export function buildReleaseOrchestrationReport(input?: {
  deploymentId?: string;
  signals?: ReleaseOrchestrationSignals;
}): ReleaseOrchestrationReport {
  const deploymentId = input?.deploymentId ?? "v66-release-orchestration-default";

  const observability = buildDeploymentObservabilityReport({ deploymentId });
  const releaseManifest = buildReleaseManifest({ deploymentId });

  const signals: ReleaseOrchestrationSignals = {
    ...DEFAULT_SIGNALS,
    observabilityReady: observability.observabilityReady,
    manifestComplete: releaseManifest.manifestComplete,
    ...input?.signals,
  };

  const rolloutStages = buildRolloutStageManifest({
    ...signals,
    rolloutStagesComplete:
      signals.rolloutStagesComplete !== false && signals.observabilityReady !== false,
  });

  const rollbackGuard = buildRollbackGuardManifest({
    ...signals,
    rolloutStagesComplete: rolloutStages.sequenceComplete,
    rollbackGuardIntact: signals.rollbackGuardIntact !== false,
  });

  const orchestrationReady =
    observability.observabilityReady &&
    releaseManifest.manifestComplete &&
    rolloutStages.sequenceComplete &&
    rollbackGuard.guardIntact;

  return {
    version: V66_RELEASE_ORCHESTRATION_VERSION,
    reportId: `release-orchestration-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    observabilityVersion: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    observabilityReady: observability.observabilityReady,
    releaseManifest,
    rolloutStages,
    rollbackGuard,
    orchestrationReady,
    readinessScore: orchestrationReady ? 100 : 0,
    summary: [
      `release-orchestration ready=${orchestrationReady}`,
      `layers=${releaseManifest.layerCount}`,
      `stages=${rolloutStages.passCount}/${rolloutStages.stageCount}`,
      `guards=${rollbackGuard.armedCount}/${rollbackGuard.ruleCount}`,
    ].join(" "),
  };
}

export function assertReleaseOrchestrationPass(
  report: ReleaseOrchestrationReport,
): asserts report is ReleaseOrchestrationReport & { orchestrationReady: true } {
  if (!report.orchestrationReady) {
    throw new Error(`V66 release orchestration not ready: ${report.summary}`);
  }
}
