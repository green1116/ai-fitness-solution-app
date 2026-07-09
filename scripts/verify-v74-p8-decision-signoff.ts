/**
 * V74 P8 — Decision Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDecisionSignoffPass,
  buildDecisionFreezeManifest,
  buildDecisionSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeV74Decision,
  collectDecisionPhaseReadiness,
  DECISION_GATE_CATALOG,
  decisionVersionLockMatchesExpected,
  formatDecisionSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isDecisionLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runDecisionSignoff,
  V74_DECISION_FREEZE_VERSION,
  V74_DECISION_LAYER_VERSION_LOCK,
  V74_DECISION_SIGNOFF_VERSION,
} from "../lib/decision/v74/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v74-p8-decision-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/decision/v74/signoff/signoff.types.ts",
    "lib/decision/v74/signoff/freeze.lock.ts",
    "lib/decision/v74/signoff/freeze.checklist.ts",
    "lib/decision/v74/signoff/release.gate.summary.ts",
    "lib/decision/v74/signoff/rollback.snapshot.index.ts",
    "lib/decision/v74/signoff/readiness.collector.ts",
    "lib/decision/v74/signoff/signoff.manifest.ts",
    "lib/decision/v74/signoff/signoff.builder.ts",
    "lib/decision/v74/signoff/signoff.entry.ts",
    "docs/V74-DECISION-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V74 decision sign-off module structure");
}

function testInventories() {
  check(DECISION_GATE_CATALOG.length === 8, "decision gate catalog P1–P8");
  check(DECISION_GATE_CATALOG[0]?.id === "DG-P1", "DG-P1 gate id");
  check(DECISION_GATE_CATALOG[7]?.id === "DG-P8", "DG-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isDecisionLayerVersionLockIntact(), "version lock intact");
  check(decisionVersionLockMatchesExpected(), "version lock matches expected");
  check(V74_DECISION_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V74_DECISION_LAYER_VERSION_LOCK.decisionCompliance.length > 0, "P7 in lock");
  check(
    V74_DECISION_LAYER_VERSION_LOCK.upstreamV73KnowledgeSignoff === "v73-knowledge-signoff-1",
    "upstream V73 signoff lock",
  );
  check(
    V74_DECISION_LAYER_VERSION_LOCK.upstreamV73KnowledgeFreeze === "v73-knowledge-freeze-1",
    "upstream V73 freeze lock",
  );
  console.log("✓ decision gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildDecisionFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.decisionCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ decision freeze manifest");
}

function testSignoffReport() {
  const incomplete = runDecisionSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildDecisionSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV74Decision({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V74_DECISION_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V74_DECISION_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all decision gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV74Decision signed off");
  assertDecisionSignoffPass(ready);

  const readiness = collectDecisionPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "DG-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    decisionReady: true,
    versionLockIntact: true,
    decisionGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ decision sign-off report");
  console.log(formatDecisionSignoffSummary(ready));
  console.log("\n✅ V74 P8 Decision Sign-off & Freeze — verify PASS");
  console.log("✅ V74 Decision Engine — CLOSED");
}

function main() {
  console.log("V74 P8 Decision Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
