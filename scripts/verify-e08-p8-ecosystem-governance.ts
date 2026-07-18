/**
 * E08-P8 — Autonomous Enterprise Ecosystem Governance Freeze Verification
 * Freeze E08 P1–P7 into ecosystem platform baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  ECOSYSTEM_GATE_CATALOG,
  assertEcosystemSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  buildEcosystemFreezeManifest,
  buildEcosystemSignoff,
  closeE08AutonomousEnterpriseEcosystemPlatform,
  collectEcosystemPhaseReadiness,
  E08_ECOSYSTEM_LAYER_VERSION_LOCK,
  E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
  E08_ECOSYSTEM_SIGNOFF_VERSION,
  formatEcosystemSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isEcosystemLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runEcosystemSignoff,
  ecosystemVersionLockMatchesExpected,
} from "../lib/ecosystem/e08/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e08-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/ecosystem/e08/signoff/signoff.types.ts",
    "lib/ecosystem/e08/signoff/freeze.lock.ts",
    "lib/ecosystem/e08/signoff/freeze.checklist.ts",
    "lib/ecosystem/e08/signoff/release.gate.summary.ts",
    "lib/ecosystem/e08/signoff/rollback.snapshot.index.ts",
    "lib/ecosystem/e08/signoff/readiness.collector.ts",
    "lib/ecosystem/e08/signoff/signoff.manifest.ts",
    "lib/ecosystem/e08/signoff/signoff.builder.ts",
    "lib/ecosystem/e08/signoff/signoff.entry.ts",
    "docs/E08-AUTONOMOUS-ENTERPRISE-ECOSYSTEM-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(ECOSYSTEM_GATE_CATALOG.length === 8, "gate catalog P1–P8");
  check(ECOSYSTEM_GATE_CATALOG[0]?.id === "EE-P1", "EE-P1 gate id");
  check(ECOSYSTEM_GATE_CATALOG[7]?.id === "EE-P8", "EE-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot 12 items");
  check(isEcosystemLayerVersionLockIntact(), "version lock intact");
  check(ecosystemVersionLockMatchesExpected(), "version lock matches");
  check(
    E08_ECOSYSTEM_LAYER_VERSION_LOCK.signoff.length > 0,
    "signoff version in lock",
  );
  check(
    E08_ECOSYSTEM_LAYER_VERSION_LOCK.ecosystem === "e08-ecosystem-1",
    "P1 ecosystem lock",
  );
  check(
    E08_ECOSYSTEM_LAYER_VERSION_LOCK.networkOs === "e08-network-os-1",
    "P7 network os lock",
  );
  check(
    E08_ECOSYSTEM_LAYER_VERSION_LOCK.networkOsFreeze ===
      "e08-network-os-freeze-1",
    "P7 freeze lock",
  );
  check(
    E08_ECOSYSTEM_LAYER_VERSION_LOCK.market === "e08-market-1",
    "P6 market lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildEcosystemFreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.networkOsBaseline.ready, "P7 network os baseline ready");
  check(
    freeze.networkOsBaseline.completedSlots ===
      freeze.networkOsBaseline.slotCount,
    "network os slots complete",
  );
  check(
    freeze.networkOsBaseline.networkOsId === "e08.networkos.capture-sector",
    "baseline network os",
  );
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ ecosystem freeze manifest");
}

function testSignoffReport() {
  const incomplete = runEcosystemSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(
    !incomplete.signoffState.signedOff,
    "broken version lock not signed off",
  );

  const ready = buildEcosystemSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeE08AutonomousEnterpriseEcosystemPlatform({
    deploymentId: DEPLOYMENT_ID,
  });

  check(ready.version === E08_ECOSYSTEM_SIGNOFF_VERSION, "signoff version");
  check(
    ready.freeze.version === E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION,
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
    "closeE08AutonomousEnterpriseEcosystemPlatform signed off",
  );
  assertEcosystemSignoffPass(ready);

  const readiness = collectEcosystemPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "EE-P8", "P8 gate id");

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
    boundary[0]?.snapshotPath === "lib/workforce/e07/",
    "E07 boundary protected",
  );

  console.log("✓ ecosystem sign-off report");
  console.log(formatEcosystemSignoffSummary(ready));
}

function main() {
  console.log(
    "E08-P8 — Autonomous Enterprise Ecosystem Governance Freeze Verification\n",
  );
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log(
    "\nPASS — E08 P8 governance (P1–P7 frozen ecosystem platform baseline)",
  );
  console.log("CLOSED — E08 Autonomous Enterprise Ecosystem Platform");
}

main();
