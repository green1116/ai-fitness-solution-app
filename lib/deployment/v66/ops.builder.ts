/**
 * V66 P7 — Deployment ops report builder (read-only)
 */
import { buildDeploymentDrReport } from "./dr.builder";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";
import { buildAutomationCatalogManifest } from "./automation.catalog";
import { buildEscalationMapManifest } from "./escalation.map";
import { buildOperatorActionsManifest } from "./operator.actions.matrix";
import type { DeploymentOpsReport, DeploymentOpsSignals } from "./ops.types";
import { V66_DEPLOYMENT_OPS_VERSION } from "./ops.types";
import { buildRunbookChecklistManifest } from "./runbook.checklist";

const DEFAULT_SIGNALS: DeploymentOpsSignals = {
  drReady: true,
  automationCatalogComplete: true,
  runbookChecklistPass: true,
  operatorActionsComplete: true,
  escalationMapComplete: true,
};

export function buildDeploymentOpsReport(input?: {
  deploymentId?: string;
  signals?: DeploymentOpsSignals;
}): DeploymentOpsReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-ops-default";

  const dr = buildDeploymentDrReport({ deploymentId });
  const automationCatalog = buildAutomationCatalogManifest();
  const operatorActions = buildOperatorActionsManifest();
  const escalationMap = buildEscalationMapManifest();

  const signals: DeploymentOpsSignals = {
    ...DEFAULT_SIGNALS,
    drReady: dr.drReady,
    automationCatalogComplete: automationCatalog.catalogComplete,
    operatorActionsComplete: operatorActions.matrixComplete,
    escalationMapComplete: escalationMap.mapComplete,
    ...input?.signals,
  };

  const runbookChecklist = buildRunbookChecklistManifest({
    ...signals,
    runbookChecklistPass:
      signals.runbookChecklistPass !== false && signals.drReady !== false,
  });

  const opsReady =
    dr.drReady &&
    automationCatalog.catalogComplete &&
    runbookChecklist.checklistPass &&
    operatorActions.matrixComplete &&
    escalationMap.mapComplete;

  return {
    version: V66_DEPLOYMENT_OPS_VERSION,
    reportId: `deployment-ops-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    drVersion: V66_DEPLOYMENT_DR_VERSION,
    drReady: dr.drReady,
    automationCatalog,
    runbookChecklist,
    operatorActions,
    escalationMap,
    opsReady,
    readinessScore: opsReady ? 100 : 0,
    summary: [
      `deployment-ops ready=${opsReady}`,
      `automation=${automationCatalog.entryCount}`,
      `runbook=${runbookChecklist.passCount}/${runbookChecklist.itemCount}`,
      `actions=${operatorActions.actionCount}`,
      `escalation=${escalationMap.entryCount}`,
    ].join(" "),
  };
}

export function assertDeploymentOpsPass(
  report: DeploymentOpsReport,
): asserts report is DeploymentOpsReport & { opsReady: true } {
  if (!report.opsReady) {
    throw new Error(`V66 deployment ops not ready: ${report.summary}`);
  }
}
