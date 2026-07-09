/**
 * V66 P8 — Deployment sign-off entry (read-only)
 */
import { buildDeploymentSignoffReport } from "./signoff.builder";
import type { DeploymentSignoffReport, DeploymentSignoffSignals } from "./signoff.types";

export type { DeploymentSignoffSignals };

export function runDeploymentSignoff(input?: {
  deploymentId?: string;
  signals?: DeploymentSignoffSignals;
}): DeploymentSignoffReport {
  return buildDeploymentSignoffReport(input);
}

export function closeV66Deployment(input?: {
  deploymentId?: string;
  signals?: DeploymentSignoffSignals;
}): DeploymentSignoffReport {
  return buildDeploymentSignoffReport(input);
}

export function formatDeploymentSignoffSummary(report: DeploymentSignoffReport): string {
  return report.closingSummary;
}
