/**
 * V66 P2 — Deployment execution entry (read-only)
 */
import { buildDeploymentExecutionReport } from "./execution.builder";
import type { DeploymentExecutionReport, DeploymentExecutionSignals } from "./execution.types";

export type { DeploymentExecutionSignals };

export function runDeploymentExecution(input?: {
  deploymentId?: string;
  signals?: DeploymentExecutionSignals;
}): DeploymentExecutionReport {
  return buildDeploymentExecutionReport(input);
}

export function formatDeploymentExecutionSummary(report: DeploymentExecutionReport): string {
  const lines = [
    "V66 Deployment Execution & Health Checks",
    `  ready: ${report.executionReady}`,
    `  score: ${report.readinessScore}/100`,
    `  baseline: ${report.baselineVersion} (ready=${report.baselineReady})`,
    `  health checks: ${report.healthChecks.passCount}/${report.healthChecks.checkCount}`,
    `  startup steps: ${report.startupVerification.passCount}/${report.startupVerification.stepCount}`,
    `  readiness probes: ${report.readinessProbes.probeCount}`,
    `  probe surface: ${report.readinessProbes.surfaceComplete}`,
  ];
  return lines.join("\n");
}
