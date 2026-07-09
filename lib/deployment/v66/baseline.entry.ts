/**
 * V66 P1 — Deployment baseline entry (read-only)
 */
import { buildDeploymentBaselineReport } from "./baseline.builder";
import type { DeploymentBaselineReport, DeploymentBaselineSignals } from "./baseline.types";
import type { DeploymentTarget } from "./baseline.types";

export type { DeploymentBaselineSignals };

export function runDeploymentBaseline(input?: {
  deploymentId?: string;
  targetEnvironment?: DeploymentTarget;
  signals?: DeploymentBaselineSignals;
}): DeploymentBaselineReport {
  return buildDeploymentBaselineReport(input);
}

export function formatDeploymentBaselineSummary(report: DeploymentBaselineReport): string {
  const lines = [
    "V66 Deployment Baseline & Env Contract",
    `  ready: ${report.deploymentReady}`,
    `  score: ${report.readinessScore}/100`,
    `  environment: ${report.targetEnvironment}`,
    `  env vars: ${report.envContract.variableCount}`,
    `  required prod: ${report.envContract.requiredInProduction.length}`,
    `  forbidden prod: ${report.envContract.forbiddenInProduction.length}`,
    `  runtime surface: ${report.runtimeConfigSurface.entryCount} entries`,
    `  checklist: ${report.checklistPassCount}/${report.deploymentChecklist.length}`,
    `  upstream frozen: ${report.upstreamFrozenIntact}`,
  ];
  return lines.join("\n");
}
