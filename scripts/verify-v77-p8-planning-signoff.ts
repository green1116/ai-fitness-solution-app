/**
 * V77 P8 — Planning Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  PLANNING_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V77_PLANNING_FREEZE_VERSION,
  V77_PLANNING_LAYER_VERSION_LOCK,
  V77_PLANNING_SIGNOFF_VERSION,
  assertPlanningSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildPlanningFreezeManifest,
  buildPlanningSignoff,
  buildRollbackSnapshotIndex,
  closeV77Planning,
  collectPlanningPhaseReadiness,
  formatPlanningSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isPlanningLayerVersionLockIntact,
  planningVersionLockMatchesExpected,
  runPlanningSignoff,
} from "../lib/planning/v77/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v77-p8-planning-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/planning/v77/signoff/signoff.types.ts",
    "lib/planning/v77/signoff/freeze.lock.ts",
    "lib/planning/v77/signoff/freeze.checklist.ts",
    "lib/planning/v77/signoff/release.gate.summary.ts",
    "lib/planning/v77/signoff/rollback.snapshot.index.ts",
    "lib/planning/v77/signoff/readiness.collector.ts",
    "lib/planning/v77/signoff/signoff.manifest.ts",
    "lib/planning/v77/signoff/signoff.builder.ts",
    "lib/planning/v77/signoff/signoff.entry.ts",
    "docs/V77-PLANNING-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V77 planning sign-off module structure");
}

function testInventories() {
  check(PLANNING_GATE_CATALOG.length === 8, "planning gate catalog P1–P8");
  check(PLANNING_GATE_CATALOG[0]?.id === "PLN-P1", "PLN-P1 gate id");
  check(PLANNING_GATE_CATALOG[7]?.id === "PLN-P8", "PLN-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isPlanningLayerVersionLockIntact(), "version lock intact");
  check(planningVersionLockMatchesExpected(), "version lock matches expected");
  check(V77_PLANNING_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V77_PLANNING_LAYER_VERSION_LOCK.planningCompliance.length > 0, "P7 in lock");
  check(
    V77_PLANNING_LAYER_VERSION_LOCK.upstreamV76CollaborationSignoff === "v76-collaboration-signoff-1",
    "upstream V76 signoff lock",
  );
  check(
    V77_PLANNING_LAYER_VERSION_LOCK.upstreamV76CollaborationFreeze === "v76-collaboration-freeze-1",
    "upstream V76 freeze lock",
  );
  console.log("✓ planning gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildPlanningFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.planningCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ planning freeze manifest");
}

function testSignoffReport() {
  const incomplete = runPlanningSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildPlanningSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV77Planning({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V77_PLANNING_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V77_PLANNING_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all planning gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV77Planning signed off");
  assertPlanningSignoffPass(ready);

  const readiness = collectPlanningPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "PLN-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    planningReady: true,
    versionLockIntact: true,
    planningGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ planning sign-off report");
  console.log(formatPlanningSignoffSummary(ready));
  console.log("\n✅ V77 P8 Planning Sign-off & Freeze — verify PASS");
  console.log("✅ V77 Planning — CLOSED");
}

function main() {
  console.log("V77 P8 Planning Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
