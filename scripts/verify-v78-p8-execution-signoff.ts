/**
 * V78 P8 — Execution Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  EXECUTION_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V78_EXECUTION_FREEZE_VERSION,
  V78_EXECUTION_LAYER_VERSION_LOCK,
  V78_EXECUTION_SIGNOFF_VERSION,
  assertExecutionSignoffPass,
  buildExecutionFreezeManifest,
  buildExecutionSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeV78Execution,
  collectExecutionPhaseReadiness,
  executionVersionLockMatchesExpected,
  formatExecutionSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isExecutionLayerVersionLockIntact,
  runExecutionSignoff,
} from "../lib/execution/v78/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v78-p8-execution-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/execution/v78/signoff/signoff.types.ts",
    "lib/execution/v78/signoff/freeze.lock.ts",
    "lib/execution/v78/signoff/freeze.checklist.ts",
    "lib/execution/v78/signoff/release.gate.summary.ts",
    "lib/execution/v78/signoff/rollback.snapshot.index.ts",
    "lib/execution/v78/signoff/readiness.collector.ts",
    "lib/execution/v78/signoff/signoff.manifest.ts",
    "lib/execution/v78/signoff/signoff.builder.ts",
    "lib/execution/v78/signoff/signoff.entry.ts",
    "docs/V78-EXECUTION-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V78 execution sign-off module structure");
}

function testInventories() {
  check(EXECUTION_GATE_CATALOG.length === 8, "execution gate catalog P1–P8");
  check(EXECUTION_GATE_CATALOG[0]?.id === "EXE-P1", "EXE-P1 gate id");
  check(EXECUTION_GATE_CATALOG[7]?.id === "EXE-P8", "EXE-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isExecutionLayerVersionLockIntact(), "version lock intact");
  check(executionVersionLockMatchesExpected(), "version lock matches expected");
  check(V78_EXECUTION_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V78_EXECUTION_LAYER_VERSION_LOCK.executionCompliance.length > 0, "P7 in lock");
  check(
    V78_EXECUTION_LAYER_VERSION_LOCK.upstreamV77PlanningSignoff === "v77-planning-signoff-1",
    "upstream V77 signoff lock",
  );
  check(
    V78_EXECUTION_LAYER_VERSION_LOCK.upstreamV77PlanningFreeze === "v77-planning-freeze-1",
    "upstream V77 freeze lock",
  );
  console.log("✓ execution gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildExecutionFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.executionCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ execution freeze manifest");
}

function testSignoffReport() {
  const incomplete = runExecutionSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildExecutionSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV78Execution({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V78_EXECUTION_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V78_EXECUTION_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all execution gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV78Execution signed off");
  assertExecutionSignoffPass(ready);

  const readiness = collectExecutionPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "EXE-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    executionReady: true,
    versionLockIntact: true,
    executionGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ execution sign-off report");
  console.log(formatExecutionSignoffSummary(ready));
  console.log("\n✅ V78 P8 Execution Sign-off & Freeze — verify PASS");
  console.log("✅ V78 Execution — CLOSED");
}

function main() {
  console.log("V78 P8 Execution Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
