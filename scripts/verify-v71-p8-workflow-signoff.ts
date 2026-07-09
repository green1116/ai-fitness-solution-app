/**
 * V71 P8 — Workflow Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertWorkflowSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  buildWorkflowFreezeManifest,
  buildWorkflowSignoff,
  closeV71Orchestration,
  collectWorkflowPhaseReadiness,
  formatWorkflowSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isWorkflowLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runWorkflowSignoff,
  V71_WORKFLOW_FREEZE_VERSION,
  V71_WORKFLOW_LAYER_VERSION_LOCK,
  V71_WORKFLOW_SIGNOFF_VERSION,
  WORKFLOW_GATE_CATALOG,
  workflowVersionLockMatchesExpected,
} from "../lib/orchestration/v71/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v71-p8-workflow-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/orchestration/v71/signoff/signoff.types.ts",
    "lib/orchestration/v71/signoff/freeze.lock.ts",
    "lib/orchestration/v71/signoff/freeze.checklist.ts",
    "lib/orchestration/v71/signoff/release.gate.summary.ts",
    "lib/orchestration/v71/signoff/rollback.snapshot.index.ts",
    "lib/orchestration/v71/signoff/readiness.collector.ts",
    "lib/orchestration/v71/signoff/signoff.manifest.ts",
    "lib/orchestration/v71/signoff/signoff.builder.ts",
    "lib/orchestration/v71/signoff/signoff.entry.ts",
    "docs/V71-P8-WORKFLOW-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V71 workflow sign-off module structure");
}

function testInventories() {
  check(WORKFLOW_GATE_CATALOG.length === 8, "workflow gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isWorkflowLayerVersionLockIntact(), "version lock intact");
  check(workflowVersionLockMatchesExpected(), "version lock matches expected");
  check(V71_WORKFLOW_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V71_WORKFLOW_LAYER_VERSION_LOCK.workflowCompliance.length > 0, "P7 in lock");
  console.log("✓ workflow gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildWorkflowFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.workflowCompliance.complianceReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ workflow freeze manifest");
}

function testSignoffReport() {
  const incomplete = runWorkflowSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildWorkflowSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV71Orchestration({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V71_WORKFLOW_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V71_WORKFLOW_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all workflow gates pass");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV71Orchestration signed off");
  assertWorkflowSignoffPass(ready);

  const readiness = collectWorkflowPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");

  const checklist = buildFreezeChecklistManifest({
    workflowReady: true,
    versionLockIntact: true,
    workflowGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ workflow sign-off report");
  console.log(formatWorkflowSignoffSummary(ready));
  console.log("\n✅ V71 P8 Workflow Sign-off & Freeze — verify PASS");
  console.log("✅ V71 Workflow Orchestration — CLOSED");
}

function main() {
  console.log("V71 P8 Workflow Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
