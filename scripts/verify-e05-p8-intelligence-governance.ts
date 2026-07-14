/**
 * E05-P8 — Intelligence Governance Freeze Verification
 * Freeze E05 P1–P7 into enterprise intelligence baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  E05_INTELLIGENCE_LAYER_VERSION_LOCK,
  E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
  E05_INTELLIGENCE_SIGNOFF_VERSION,
  INTELLIGENCE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  assertIntelligenceSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildIntelligenceFreezeManifest,
  buildIntelligenceSignoff,
  buildRollbackSnapshotIndex,
  closeE05IntelligenceLayer,
  collectIntelligencePhaseReadiness,
  formatIntelligenceSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  intelligenceVersionLockMatchesExpected,
  isIntelligenceLayerVersionLockIntact,
  runIntelligenceSignoff,
} from "../lib/intelligence/e05/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e05-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/e05/signoff/signoff.types.ts",
    "lib/intelligence/e05/signoff/freeze.lock.ts",
    "lib/intelligence/e05/signoff/freeze.checklist.ts",
    "lib/intelligence/e05/signoff/release.gate.summary.ts",
    "lib/intelligence/e05/signoff/rollback.snapshot.index.ts",
    "lib/intelligence/e05/signoff/readiness.collector.ts",
    "lib/intelligence/e05/signoff/signoff.manifest.ts",
    "lib/intelligence/e05/signoff/signoff.builder.ts",
    "lib/intelligence/e05/signoff/signoff.entry.ts",
    "docs/E05-INTELLIGENCE-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(INTELLIGENCE_GATE_CATALOG.length === 8, "gate catalog P1–P8");
  check(INTELLIGENCE_GATE_CATALOG[0]?.id === "EI-P1", "EI-P1 gate id");
  check(INTELLIGENCE_GATE_CATALOG[7]?.id === "EI-P8", "EI-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot 12 items");
  check(isIntelligenceLayerVersionLockIntact(), "version lock intact");
  check(intelligenceVersionLockMatchesExpected(), "version lock matches");
  check(
    E05_INTELLIGENCE_LAYER_VERSION_LOCK.signoff.length > 0,
    "signoff version in lock",
  );
  check(
    E05_INTELLIGENCE_LAYER_VERSION_LOCK.strategy === "e05-strategy-1",
    "P7 strategy lock",
  );
  check(
    E05_INTELLIGENCE_LAYER_VERSION_LOCK.strategyFreeze ===
      "e05-strategy-freeze-1",
    "P7 freeze lock",
  );
  check(
    E05_INTELLIGENCE_LAYER_VERSION_LOCK.foundation === "e05-intelligence-1",
    "P1 foundation lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildIntelligenceFreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.strategyBaseline.ready, "P7 strategy baseline ready");
  check(freeze.strategyBaseline.stepCount === 4, "strategy steps");
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
  const closed = closeE05IntelligenceLayer({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === E05_INTELLIGENCE_SIGNOFF_VERSION, "signoff version");
  check(
    ready.freeze.version === E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION,
    "freeze version",
  );
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeE05IntelligenceLayer signed off");
  assertIntelligenceSignoffPass(ready);

  const readiness = collectIntelligencePhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "EI-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    platformReady: true,
    versionLockIntact: true,
    platformGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ intelligence sign-off report");
  console.log(formatIntelligenceSignoffSummary(ready));
}

function main() {
  console.log("E05-P8 — Intelligence Governance Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log(
    "\nPASS — E05 P8 governance (P1–P7 frozen enterprise intelligence baseline)",
  );
  console.log("CLOSED — E05 Enterprise Intelligence Layer");
}

main();
