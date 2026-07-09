/**
 * V66 P3 — Deployment observability baseline report builder (read-only)
 */
import { buildDeploymentExecutionReport } from "./execution.builder";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";
import { buildDeploymentLogManifest, buildSampleDeploymentLogs } from "./deployment.log.formatter";
import { buildOpsEventManifest } from "./ops.event.catalog";
import type {
  DeploymentObservabilityReport,
  DeploymentObservabilitySignals,
} from "./observability.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";
import { buildObservabilitySurfaceManifest } from "./observability.surface";

const DEFAULT_SIGNALS: DeploymentObservabilitySignals = {
  executionReady: true,
  logSchemaComplete: true,
  opsEventCatalogComplete: true,
  observabilitySurfaceComplete: true,
};

export function buildDeploymentObservabilityReport(input?: {
  deploymentId?: string;
  signals?: DeploymentObservabilitySignals;
}): DeploymentObservabilityReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-observability-default";

  const execution = buildDeploymentExecutionReport({ deploymentId });
  const deploymentLogs = buildDeploymentLogManifest();
  const opsEvents = buildOpsEventManifest();
  const observabilitySurface = buildObservabilitySurfaceManifest();

  const signals: DeploymentObservabilitySignals = {
    ...DEFAULT_SIGNALS,
    executionReady: execution.executionReady,
    logSchemaComplete: deploymentLogs.schemaComplete,
    opsEventCatalogComplete: opsEvents.catalogComplete,
    observabilitySurfaceComplete: observabilitySurface.surfaceComplete,
    ...input?.signals,
  };

  const observabilityReady =
    signals.executionReady === true &&
    signals.logSchemaComplete === true &&
    signals.opsEventCatalogComplete === true &&
    signals.observabilitySurfaceComplete === true;

  const sampleLogs = buildSampleDeploymentLogs(deploymentId);

  return {
    version: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    reportId: `deployment-observability-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    executionVersion: V66_DEPLOYMENT_EXECUTION_VERSION,
    executionReady: execution.executionReady,
    deploymentLogs,
    opsEvents,
    observabilitySurface,
    sampleLogs,
    observabilityReady,
    readinessScore: observabilityReady ? 100 : 0,
    summary: [
      `deployment-observability ready=${observabilityReady}`,
      `logs=${deploymentLogs.eventCount}`,
      `opsEvents=${opsEvents.eventCount}`,
      `surface=${observabilitySurface.entryCount}`,
    ].join(" "),
  };
}

export function assertDeploymentObservabilityPass(
  report: DeploymentObservabilityReport,
): asserts report is DeploymentObservabilityReport & { observabilityReady: true } {
  if (!report.observabilityReady) {
    throw new Error(`V66 deployment observability not ready: ${report.summary}`);
  }
}
