/**
 * V66 P6 — Disaster recovery report builder (read-only)
 */
import { buildBackupPolicyManifest } from "./backup.policy.catalog";
import { buildDeploymentSecurityReport } from "./security.builder";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";
import type { DeploymentDrReport, DeploymentDrSignals } from "./dr.types";
import { V66_DEPLOYMENT_DR_VERSION } from "./dr.types";
import { buildRecoveryPointManifest } from "./recovery.point.inventory";
import { buildRestoreChecklistManifest } from "./restore.checklist";
import { buildRetentionMatrixManifest } from "./retention.matrix";

const DEFAULT_SIGNALS: DeploymentDrSignals = {
  securityReady: true,
  backupPolicyCatalogComplete: true,
  restoreChecklistPass: true,
  retentionMatrixComplete: true,
  recoveryPointInventoryComplete: true,
};

export function buildDeploymentDrReport(input?: {
  deploymentId?: string;
  signals?: DeploymentDrSignals;
}): DeploymentDrReport {
  const deploymentId = input?.deploymentId ?? "v66-deployment-dr-default";

  const security = buildDeploymentSecurityReport({ deploymentId });
  const backupPolicies = buildBackupPolicyManifest();
  const retentionMatrix = buildRetentionMatrixManifest();
  const recoveryPoints = buildRecoveryPointManifest();

  const signals: DeploymentDrSignals = {
    ...DEFAULT_SIGNALS,
    securityReady: security.securityReady,
    backupPolicyCatalogComplete: backupPolicies.catalogComplete,
    retentionMatrixComplete: retentionMatrix.matrixComplete,
    recoveryPointInventoryComplete: recoveryPoints.inventoryComplete,
    ...input?.signals,
  };

  const restoreChecklist = buildRestoreChecklistManifest({
    ...signals,
    restoreChecklistPass:
      signals.restoreChecklistPass !== false && signals.securityReady !== false,
  });

  const drReady =
    security.securityReady &&
    backupPolicies.catalogComplete &&
    restoreChecklist.checklistPass &&
    retentionMatrix.matrixComplete &&
    recoveryPoints.inventoryComplete;

  return {
    version: V66_DEPLOYMENT_DR_VERSION,
    reportId: `deployment-dr-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    securityVersion: V66_DEPLOYMENT_SECURITY_VERSION,
    securityReady: security.securityReady,
    backupPolicies,
    restoreChecklist,
    retentionMatrix,
    recoveryPoints,
    drReady,
    readinessScore: drReady ? 100 : 0,
    summary: [
      `deployment-dr ready=${drReady}`,
      `policies=${backupPolicies.policyCount}`,
      `restore=${restoreChecklist.passCount}/${restoreChecklist.itemCount}`,
      `retention=${retentionMatrix.entryCount}`,
      `recoveryPoints=${recoveryPoints.pointCount}`,
    ].join(" "),
  };
}

export function assertDeploymentDrPass(
  report: DeploymentDrReport,
): asserts report is DeploymentDrReport & { drReady: true } {
  if (!report.drReady) {
    throw new Error(`V66 deployment DR not ready: ${report.summary}`);
  }
}
