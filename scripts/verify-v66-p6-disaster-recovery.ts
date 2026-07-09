/**
 * V66 P6 — Backup & Disaster Recovery Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  BACKUP_POLICY_CATALOG,
  RECOVERY_POINT_INVENTORY,
  RETENTION_MATRIX,
  V66_DEPLOYMENT_DR_VERSION,
  V66_DR_ARTIFACT_SURFACE,
  assertDeploymentDrPass,
  buildBackupPolicyManifest,
  buildDeploymentDrReport,
  buildRecoveryPointManifest,
  buildRestoreChecklistManifest,
  buildRetentionMatrixManifest,
  formatDeploymentDrSummary,
  runDeploymentDr,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p6-disaster-recovery";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/dr.ts",
    "lib/deployment/v66/dr.types.ts",
    "lib/deployment/v66/dr.artifacts.ts",
    "lib/deployment/v66/dr.builder.ts",
    "lib/deployment/v66/dr.entry.ts",
    "lib/deployment/v66/backup.policy.catalog.ts",
    "lib/deployment/v66/restore.checklist.ts",
    "lib/deployment/v66/retention.matrix.ts",
    "lib/deployment/v66/recovery.point.inventory.ts",
    "docs/deployment/V66-DISASTER-RECOVERY.md",
    ".prisma-stability/snapshots/baseline.json",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 disaster recovery module structure");
}

function testInventories() {
  assert(BACKUP_POLICY_CATALOG.length >= 8, "backup policy catalog");
  assert(RETENTION_MATRIX.length >= 6, "retention matrix");
  assert(RECOVERY_POINT_INVENTORY.length >= 8, "recovery point inventory");
  console.log("✓ backup policy, retention & recovery point inventories");
}

function testManifests() {
  const policies = buildBackupPolicyManifest();
  assert(policies.catalogComplete, "backup policy catalog complete");

  const retention = buildRetentionMatrixManifest();
  assert(retention.matrixComplete, "retention matrix complete");

  const recovery = buildRecoveryPointManifest();
  assert(recovery.inventoryComplete, "recovery point inventory complete");

  const signals = {
    securityReady: true,
    backupPolicyCatalogComplete: true,
    restoreChecklistPass: true,
    retentionMatrixComplete: true,
    recoveryPointInventoryComplete: true,
  };
  const restore = buildRestoreChecklistManifest(signals);
  assert(restore.checklistPass, "restore checklist pass");
  console.log("✓ backup, restore, retention & recovery manifests");
}

function testReport() {
  const incomplete = runDeploymentDr({
    deploymentId: DEPLOYMENT_ID,
    signals: { backupPolicyCatalogComplete: false },
  });
  assert(!incomplete.drReady, "incomplete policy not ready");

  const ready = buildDeploymentDrReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_DEPLOYMENT_DR_VERSION, "dr version");
  assert(ready.securityReady, "security ready");
  assert(ready.backupPolicies.catalogComplete, "policies complete");
  assert(ready.restoreChecklist.checklistPass, "restore checklist pass");
  assert(ready.retentionMatrix.matrixComplete, "retention complete");
  assert(ready.recoveryPoints.inventoryComplete, "recovery points complete");
  assert(ready.drReady, "dr ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertDeploymentDrPass(ready);

  assert(
    V66_DR_ARTIFACT_SURFACE.verifyDr.includes("verify:v66-p6"),
    "artifact surface verify script",
  );

  console.log("✓ disaster recovery report");
  console.log(formatDeploymentDrSummary(ready));
  console.log("\n✅ V66 P6 Backup & Disaster Recovery — verify PASS");
}

function main() {
  console.log("V66 P6 Backup & Disaster Recovery Verification\n");
  checkModuleStructure();
  testInventories();
  testManifests();
  testReport();
}

main();
