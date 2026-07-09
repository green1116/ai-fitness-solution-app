/**
 * V66 P2 — Deployment execution report builder (read-only)
 */
import { buildDeploymentBaselineReport } from "./baseline.builder";
import { V66_DEPLOYMENT_BASELINE_VERSION } from "./baseline.types";
import type { DeploymentExecutionReport, DeploymentExecutionSignals } from "./execution.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";
import { buildHealthCheckManifest, scoreHealthChecks } from "./health.checks";
import { buildReadinessProbeManifest } from "./probe.surface";
import { buildStartupVerificationManifest } from "./startup.verification";

const DEFAULT_SIGNALS: DeploymentExecutionSignals = {
  baselineReady: true,
  requiredSecretsConfigured: true,
  forbiddenFlagsClear: true,
  prismaClientGenerated: true,
  databaseReachable: false,
  buildArtifactsPresent: false,
  lockfilePresent: true,
  nodeEngineDeclared: true,
  startupSequenceComplete: true,
  probeSurfaceComplete: true,
};

export function buildDeploymentExecutionReport(input?: {
  deploymentId?: string;
  signals?: DeploymentExecutionSignals;
}): DeploymentExecutionReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-execution-default";
  const readinessProbes = buildReadinessProbeManifest();

  const baseline = buildDeploymentBaselineReport({ deploymentId });
  const signals: DeploymentExecutionSignals = {
    ...DEFAULT_SIGNALS,
    baselineReady: baseline.deploymentReady,
    probeSurfaceComplete: readinessProbes.surfaceComplete,
    ...input?.signals,
  };

  const healthChecks = buildHealthCheckManifest(signals);
  const startupVerification = buildStartupVerificationManifest(signals);

  const executionReady =
    baseline.deploymentReady &&
    healthChecks.requiredPass &&
    startupVerification.sequenceComplete &&
    readinessProbes.surfaceComplete;

  const healthScore = scoreHealthChecks(healthChecks);
  const readinessScore = executionReady
    ? 100
    : Math.round((healthScore + (startupVerification.passCount / startupVerification.stepCount) * 100) / 2);

  return {
    version: V66_DEPLOYMENT_EXECUTION_VERSION,
    reportId: `deployment-execution-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    baselineVersion: V66_DEPLOYMENT_BASELINE_VERSION,
    baselineReady: baseline.deploymentReady,
    healthChecks,
    startupVerification,
    readinessProbes,
    executionReady,
    readinessScore,
    summary: [
      `deployment-execution ready=${executionReady}`,
      `health=${healthChecks.passCount}/${healthChecks.checkCount}`,
      `startup=${startupVerification.passCount}/${startupVerification.stepCount}`,
      `probes=${readinessProbes.probeCount}`,
    ].join(" "),
  };
}

export function assertDeploymentExecutionPass(
  report: DeploymentExecutionReport,
): asserts report is DeploymentExecutionReport & { executionReady: true } {
  if (!report.executionReady) {
    throw new Error(`V66 deployment execution not ready: ${report.summary}`);
  }
}
