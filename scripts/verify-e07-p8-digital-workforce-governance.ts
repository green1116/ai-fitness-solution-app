/**
 * E07-P8 — Digital Workforce Governance Freeze Verification
 * Freeze E07 P1–P7 into digital workforce platform baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  WORKFORCE_GATE_CATALOG,
  assertWorkforceSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  buildWorkforceFreezeManifest,
  buildWorkforceSignoff,
  closeE07DigitalWorkforcePlatform,
  collectWorkforcePhaseReadiness,
  E07_WORKFORCE_LAYER_VERSION_LOCK,
  E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
  E07_WORKFORCE_SIGNOFF_VERSION,
  formatWorkforceSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isWorkforceLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runWorkforceSignoff,
  workforceVersionLockMatchesExpected,
} from "../lib/workforce/e07/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e07-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/workforce/e07/signoff/signoff.types.ts",
    "lib/workforce/e07/signoff/freeze.lock.ts",
    "lib/workforce/e07/signoff/freeze.checklist.ts",
    "lib/workforce/e07/signoff/release.gate.summary.ts",
    "lib/workforce/e07/signoff/rollback.snapshot.index.ts",
    "lib/workforce/e07/signoff/readiness.collector.ts",
    "lib/workforce/e07/signoff/signoff.manifest.ts",
    "lib/workforce/e07/signoff/signoff.builder.ts",
    "lib/workforce/e07/signoff/signoff.entry.ts",
    "docs/E07-DIGITAL-WORKFORCE-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(WORKFORCE_GATE_CATALOG.length === 8, "gate catalog P1–P8");
  check(WORKFORCE_GATE_CATALOG[0]?.id === "DW-P1", "DW-P1 gate id");
  check(WORKFORCE_GATE_CATALOG[7]?.id === "DW-P8", "DW-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot 12 items");
  check(isWorkforceLayerVersionLockIntact(), "version lock intact");
  check(workforceVersionLockMatchesExpected(), "version lock matches");
  check(
    E07_WORKFORCE_LAYER_VERSION_LOCK.signoff.length > 0,
    "signoff version in lock",
  );
  check(
    E07_WORKFORCE_LAYER_VERSION_LOCK.workforce === "e07-workforce-1",
    "P1 workforce lock",
  );
  check(
    E07_WORKFORCE_LAYER_VERSION_LOCK.organization === "e07-organization-1",
    "P7 organization lock",
  );
  check(
    E07_WORKFORCE_LAYER_VERSION_LOCK.organizationFreeze ===
      "e07-organization-freeze-1",
    "P7 freeze lock",
  );
  check(
    E07_WORKFORCE_LAYER_VERSION_LOCK.learning === "e07-learning-1",
    "P6 learning lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildWorkforceFreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.organizationBaseline.ready, "P7 organization baseline ready");
  check(
    freeze.organizationBaseline.completedUnits ===
      freeze.organizationBaseline.unitCount,
    "organization units complete",
  );
  check(
    freeze.organizationBaseline.organizationId ===
      "e07.org.commercial-division",
    "baseline organization",
  );
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ workforce freeze manifest");
}

function testSignoffReport() {
  const incomplete = runWorkforceSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(
    !incomplete.signoffState.signedOff,
    "broken version lock not signed off",
  );

  const ready = buildWorkforceSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeE07DigitalWorkforcePlatform({
    deploymentId: DEPLOYMENT_ID,
  });

  check(ready.version === E07_WORKFORCE_SIGNOFF_VERSION, "signoff version");
  check(
    ready.freeze.version === E07_WORKFORCE_PLATFORM_FREEZE_VERSION,
    "freeze version",
  );
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(
    closed.signoffState.signedOff,
    "closeE07DigitalWorkforcePlatform signed off",
  );
  assertWorkforceSignoffPass(ready);

  const readiness = collectWorkforcePhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "DW-P8", "P8 gate id");

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

  const boundary = getRollbackSnapshotByLayer("boundary");
  check(
    boundary[0]?.snapshotPath === "lib/autonomous/e06/",
    "E06 boundary protected",
  );

  console.log("✓ workforce sign-off report");
  console.log(formatWorkforceSignoffSummary(ready));
}

function main() {
  console.log("E07-P8 — Digital Workforce Governance Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log(
    "\nPASS — E07 P8 governance (P1–P7 frozen digital workforce platform baseline)",
  );
  console.log("CLOSED — E07 Digital Workforce Platform");
}

main();
