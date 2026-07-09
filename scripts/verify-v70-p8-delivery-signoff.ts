/**
 * V70 P8 — Delivery Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertDeliverySignoffPass,
  buildDeliveryFreezeManifest,
  buildDeliverySignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeV70Delivery,
  collectDeliveryPhaseReadiness,
  deliveryVersionLockMatchesExpected,
  formatDeliverySignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isDeliveryLayerVersionLockIntact,
  RELEASE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  runDeliverySignoff,
  V70_DELIVERY_FREEZE_VERSION,
  V70_DELIVERY_LAYER_VERSION_LOCK,
  V70_DELIVERY_SIGNOFF_VERSION,
} from "../lib/delivery/v70/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v70-p8-delivery-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/delivery/v70/signoff/signoff.types.ts",
    "lib/delivery/v70/signoff/freeze.lock.ts",
    "lib/delivery/v70/signoff/freeze.checklist.ts",
    "lib/delivery/v70/signoff/release.gate.summary.ts",
    "lib/delivery/v70/signoff/rollback.snapshot.index.ts",
    "lib/delivery/v70/signoff/readiness.collector.ts",
    "lib/delivery/v70/signoff/signoff.manifest.ts",
    "lib/delivery/v70/signoff/signoff.builder.ts",
    "lib/delivery/v70/signoff/signoff.entry.ts",
    "docs/V70-P8-DELIVERY-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V70 delivery sign-off module structure");
}

function testInventories() {
  check(RELEASE_GATE_CATALOG.length === 8, "release gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isDeliveryLayerVersionLockIntact(), "version lock intact");
  check(deliveryVersionLockMatchesExpected(), "version lock matches expected");
  check(V70_DELIVERY_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V70_DELIVERY_LAYER_VERSION_LOCK.deliveryCompliance.length > 0, "P7 in lock");
  console.log("✓ release gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildDeliveryFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.deliveryCompliance.complianceReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ delivery freeze manifest");
}

function testSignoffReport() {
  const incomplete = runDeliverySignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildDeliverySignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV70Delivery({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V70_DELIVERY_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V70_DELIVERY_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all release gates pass");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV70Delivery signed off");
  assertDeliverySignoffPass(ready);

  const readiness = collectDeliveryPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");

  const checklist = buildFreezeChecklistManifest({
    deliveryReady: true,
    versionLockIntact: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ delivery sign-off report");
  console.log(formatDeliverySignoffSummary(ready));
  console.log("\n✅ V70 P8 Delivery Sign-off & Freeze — verify PASS");
  console.log("✅ V70 Delivery Lifecycle — CLOSED");
}

function main() {
  console.log("V70 P8 Delivery Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
