/**
 * V66 P6 — Disaster recovery entry (read-only)
 */
import { buildDeploymentDrReport } from "./dr.builder";
import type { DeploymentDrReport, DeploymentDrSignals } from "./dr.types";

export type { DeploymentDrSignals };

export function runDeploymentDr(input?: {
  deploymentId?: string;
  signals?: DeploymentDrSignals;
}): DeploymentDrReport {
  return buildDeploymentDrReport(input);
}

export function formatDeploymentDrSummary(report: DeploymentDrReport): string {
  const lines = [
    "V66 Backup & Disaster Recovery",
    `  ready: ${report.drReady}`,
    `  score: ${report.readinessScore}/100`,
    `  security: ${report.securityVersion} (ready=${report.securityReady})`,
    `  backup policies: ${report.backupPolicies.policyCount}`,
    `  restore checklist: ${report.restoreChecklist.passCount}/${report.restoreChecklist.itemCount}`,
    `  retention matrix: ${report.retentionMatrix.entryCount}`,
    `  recovery points: ${report.recoveryPoints.pointCount}`,
  ];
  return lines.join("\n");
}
