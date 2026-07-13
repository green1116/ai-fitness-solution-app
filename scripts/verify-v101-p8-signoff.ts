/**
 * E01-P8 — Enterprise Tender Intelligence Sign-off & Freeze Verification
 * Freeze E01 P1–P7 into release baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  TENDER_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V101_TENDER_FREEZE_VERSION,
  V101_TENDER_LAYER_VERSION_LOCK,
  V101_TENDER_SIGNOFF_VERSION,
  assertTenderSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  buildTenderFreezeManifest,
  buildTenderSignoff,
  closeE01TenderIntelligence,
  collectTenderPhaseReadiness,
  formatTenderSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isTenderLayerVersionLockIntact,
  runTenderSignoff,
  tenderVersionLockMatchesExpected,
} from "../lib/tender-intelligence/v101/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p8-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-intelligence/v101/signoff/signoff.types.ts",
    "lib/tender-intelligence/v101/signoff/freeze.lock.ts",
    "lib/tender-intelligence/v101/signoff/freeze.checklist.ts",
    "lib/tender-intelligence/v101/signoff/release.gate.summary.ts",
    "lib/tender-intelligence/v101/signoff/rollback.snapshot.index.ts",
    "lib/tender-intelligence/v101/signoff/readiness.collector.ts",
    "lib/tender-intelligence/v101/signoff/signoff.manifest.ts",
    "lib/tender-intelligence/v101/signoff/signoff.builder.ts",
    "lib/tender-intelligence/v101/signoff/signoff.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(TENDER_GATE_CATALOG.length === 8, "tender gate catalog P1–P8");
  check(TENDER_GATE_CATALOG[0]?.id === "TI-P1", "TI-P1 gate id");
  check(TENDER_GATE_CATALOG[7]?.id === "TI-P8", "TI-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isTenderLayerVersionLockIntact(), "version lock intact");
  check(tenderVersionLockMatchesExpected(), "version lock matches expected");
  check(V101_TENDER_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V101_TENDER_LAYER_VERSION_LOCK.delivery.length > 0, "P7 in lock");
  check(
    V101_TENDER_LAYER_VERSION_LOCK.intake === "v101-tender-intake-1",
    "P1 intake lock",
  );
  check(
    V101_TENDER_LAYER_VERSION_LOCK.deliveryFreeze === "v101-enterprise-delivery-freeze-1",
    "P7 delivery freeze lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildTenderFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.deliveryBaseline.ready, "P7 delivery baseline ready");
  check(freeze.deliveryBaseline.sealHash !== null, "delivery seal hash");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ tender freeze manifest");
}

function testSignoffReport() {
  const incomplete = runTenderSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildTenderSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeE01TenderIntelligence({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V101_TENDER_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V101_TENDER_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all tender gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeE01TenderIntelligence signed off");
  assertTenderSignoffPass(ready);

  const readiness = collectTenderPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "TI-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    tenderReady: true,
    versionLockIntact: true,
    tenderGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ tender sign-off report");
  console.log(formatTenderSignoffSummary(ready));
}

function main() {
  console.log("E01-P8 — Enterprise Tender Intelligence Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log("\nPASS — V101 P8 signoff (P1–P7 frozen release baseline)");
  console.log("CLOSED — E01 Enterprise Tender Intelligence");
}

main();
