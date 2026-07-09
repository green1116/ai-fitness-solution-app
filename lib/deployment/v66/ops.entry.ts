/**
 * V66 P7 — Deployment ops entry (read-only)
 */
import { buildDeploymentOpsReport } from "./ops.builder";
import type { DeploymentOpsReport, DeploymentOpsSignals } from "./ops.types";

export type { DeploymentOpsSignals };

export function runDeploymentOps(input?: {
  deploymentId?: string;
  signals?: DeploymentOpsSignals;
}): DeploymentOpsReport {
  return buildDeploymentOpsReport(input);
}

export function formatDeploymentOpsSummary(report: DeploymentOpsReport): string {
  const lines = [
    "V66 Deployment Automation & Ops Runbook",
    `  ready: ${report.opsReady}`,
    `  score: ${report.readinessScore}/100`,
    `  dr: ${report.drVersion} (ready=${report.drReady})`,
    `  automation catalog: ${report.automationCatalog.entryCount}`,
    `  runbook checklist: ${report.runbookChecklist.passCount}/${report.runbookChecklist.itemCount}`,
    `  operator actions: ${report.operatorActions.actionCount}`,
    `  escalation map: ${report.escalationMap.entryCount}`,
  ];
  return lines.join("\n");
}
