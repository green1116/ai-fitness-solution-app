/**
 * V72 P8 — Intelligence Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildIntelligenceFreezeManifest,
  buildIntelligenceSignoff,
  buildRollbackSnapshotIndex,
  closeV72Intelligence,
  collectIntelligencePhaseReadiness,
  formatIntelligenceSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  INTELLIGENCE_GATE_CATALOG,
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runIntelligenceSignoff,
  V72_INTELLIGENCE_FREEZE_VERSION,
  V72_INTELLIGENCE_LAYER_VERSION_LOCK,
  V72_INTELLIGENCE_SIGNOFF_VERSION,
} from "../lib/intelligence/v72/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p8-intelligence-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/signoff/signoff.types.ts",
    "lib/intelligence/v72/signoff/freeze.lock.ts",
    "lib/intelligence/v72/signoff/freeze.checklist.ts",
    "lib/intelligence/v72/signoff/release.gate.summary.ts",
    "lib/intelligence/v72/signoff/rollback.snapshot.index.ts",
    "lib/intelligence/v72/signoff/readiness.collector.ts",
    "lib/intelligence/v72/signoff/signoff.manifest.ts",
    "lib/intelligence/v72/signoff/signoff.builder.ts",
    "lib/intelligence/v72/signoff/signoff.entry.ts",
    "docs/V72-P8-INTELLIGENCE-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence sign-off module structure");
}

function testInventories() {
  check(INTELLIGENCE_GATE_CATALOG.length === 8, "intelligence gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isIntelligenceLayerVersionLockIntact(), "version lock intact");
  check(intelligenceVersionLockMatchesExpected(), "version lock matches expected");
  check(V72_INTELLIGENCE_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V72_INTELLIGENCE_LAYER_VERSION_LOCK.intelligenceCompliance.length > 0, "P7 in lock");
  console.log("✓ intelligence gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildIntelligenceFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.intelligenceCompliance.complianceReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ intelligence freeze manifest");
}

function testSignoffReport() {
  const incomplete = runIntelligenceSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildIntelligenceSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV72Intelligence({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V72_INTELLIGENCE_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V72_INTELLIGENCE_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all intelligence gates pass");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV72Intelligence signed off");
  assertIntelligenceSignoffPass(ready);

  const readiness = collectIntelligencePhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");

  const checklist = buildFreezeChecklistManifest({
    intelligenceReady: true,
    versionLockIntact: true,
    intelligenceGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ intelligence sign-off report");
  console.log(formatIntelligenceSignoffSummary(ready));
  console.log("\n✅ V72 P8 Intelligence Sign-off & Freeze — verify PASS");
  console.log("✅ V72 Operational Intelligence — CLOSED");
}

function main() {
  console.log("V72 P8 Intelligence Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
