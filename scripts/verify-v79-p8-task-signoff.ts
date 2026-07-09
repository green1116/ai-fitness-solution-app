/**
 * V79 P8 — Task Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ROLLBACK_SNAPSHOT_INDEX,
  TASK_GATE_CATALOG,
  V79_TASK_FREEZE_VERSION,
  V79_TASK_LAYER_VERSION_LOCK,
  V79_TASK_SIGNOFF_VERSION,
  assertTaskSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  buildTaskFreezeManifest,
  buildTaskSignoff,
  closeV79Task,
  collectTaskPhaseReadiness,
  formatTaskSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isTaskLayerVersionLockIntact,
  runTaskSignoff,
  taskVersionLockMatchesExpected,
} from "../lib/task/v79/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v79-p8-task-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/task/v79/signoff/signoff.types.ts",
    "lib/task/v79/signoff/freeze.lock.ts",
    "lib/task/v79/signoff/freeze.checklist.ts",
    "lib/task/v79/signoff/release.gate.summary.ts",
    "lib/task/v79/signoff/rollback.snapshot.index.ts",
    "lib/task/v79/signoff/readiness.collector.ts",
    "lib/task/v79/signoff/signoff.manifest.ts",
    "lib/task/v79/signoff/signoff.builder.ts",
    "lib/task/v79/signoff/signoff.entry.ts",
    "docs/V79-TASK-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V79 task sign-off module structure");
}

function testInventories() {
  check(TASK_GATE_CATALOG.length === 8, "task gate catalog P1–P8");
  check(TASK_GATE_CATALOG[0]?.id === "TSK-P1", "TSK-P1 gate id");
  check(TASK_GATE_CATALOG[7]?.id === "TSK-P8", "TSK-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isTaskLayerVersionLockIntact(), "version lock intact");
  check(taskVersionLockMatchesExpected(), "version lock matches expected");
  check(V79_TASK_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V79_TASK_LAYER_VERSION_LOCK.taskCompliance.length > 0, "P7 in lock");
  check(
    V79_TASK_LAYER_VERSION_LOCK.upstreamV78ExecutionSignoff === "v78-execution-signoff-1",
    "upstream V78 signoff lock",
  );
  check(
    V79_TASK_LAYER_VERSION_LOCK.upstreamV78ExecutionFreeze === "v78-execution-freeze-1",
    "upstream V78 freeze lock",
  );
  console.log("✓ task gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildTaskFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.taskCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ task freeze manifest");
}

function testSignoffReport() {
  const incomplete = runTaskSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildTaskSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV79Task({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V79_TASK_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V79_TASK_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all task gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV79Task signed off");
  assertTaskSignoffPass(ready);

  const readiness = collectTaskPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "TSK-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    taskReady: true,
    versionLockIntact: true,
    taskGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ task sign-off report");
  console.log(formatTaskSignoffSummary(ready));
  console.log("\n✅ V79 P8 Task Sign-off & Freeze — verify PASS");
  console.log("✅ V79 Task — CLOSED");
}

function main() {
  console.log("V79 P8 Task Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
