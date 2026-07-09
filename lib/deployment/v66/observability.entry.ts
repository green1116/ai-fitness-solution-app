/**
 * V66 P3 — Deployment observability entry (read-only)
 */
import { buildDeploymentObservabilityReport } from "./observability.builder";
import type {
  DeploymentObservabilityReport,
  DeploymentObservabilitySignals,
} from "./observability.types";

export type { DeploymentObservabilitySignals };

export function runDeploymentObservability(input?: {
  deploymentId?: string;
  signals?: DeploymentObservabilitySignals;
}): DeploymentObservabilityReport {
  return buildDeploymentObservabilityReport(input);
}

export function formatDeploymentObservabilitySummary(
  report: DeploymentObservabilityReport,
): string {
  const lines = [
    "V66 Deployment Observability Baseline",
    `  ready: ${report.observabilityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  execution: ${report.executionVersion} (ready=${report.executionReady})`,
    `  log events: ${report.deploymentLogs.eventCount}`,
    `  ops events: ${report.opsEvents.eventCount}`,
    `  observability surface: ${report.observabilitySurface.entryCount}`,
    `  sample logs: ${report.sampleLogs.length}`,
  ];
  return lines.join("\n");
}
