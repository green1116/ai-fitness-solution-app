/**
 * E06-P8 — Autonomous Enterprise OS Governance Freeze Verification
 * Freeze E06 P1–P7 into autonomous enterprise OS baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  AUTONOMOUS_GATE_CATALOG,
  assertAutonomousSignoffPass,
  autonomousVersionLockMatchesExpected,
  buildAutonomousFreezeManifest,
  buildAutonomousSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeE06AutonomousEnterpriseOS,
  collectAutonomousPhaseReadiness,
  E06_AUTONOMOUS_LAYER_VERSION_LOCK,
  E06_AUTONOMOUS_OS_FREEZE_VERSION,
  E06_AUTONOMOUS_SIGNOFF_VERSION,
  formatAutonomousSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isAutonomousLayerVersionLockIntact,
  ROLLBACK_SNAPSHOT_INDEX,
  runAutonomousSignoff,
} from "../lib/autonomous/e06/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e06-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/autonomous/e06/signoff/signoff.types.ts",
    "lib/autonomous/e06/signoff/freeze.lock.ts",
    "lib/autonomous/e06/signoff/freeze.checklist.ts",
    "lib/autonomous/e06/signoff/release.gate.summary.ts",
    "lib/autonomous/e06/signoff/rollback.snapshot.index.ts",
    "lib/autonomous/e06/signoff/readiness.collector.ts",
    "lib/autonomous/e06/signoff/signoff.manifest.ts",
    "lib/autonomous/e06/signoff/signoff.builder.ts",
    "lib/autonomous/e06/signoff/signoff.entry.ts",
    "docs/E06-AUTONOMOUS-ENTERPRISE-OS-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(AUTONOMOUS_GATE_CATALOG.length === 8, "gate catalog P1–P8");
  check(AUTONOMOUS_GATE_CATALOG[0]?.id === "EA-P1", "EA-P1 gate id");
  check(AUTONOMOUS_GATE_CATALOG[7]?.id === "EA-P8", "EA-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot 12 items");
  check(isAutonomousLayerVersionLockIntact(), "version lock intact");
  check(autonomousVersionLockMatchesExpected(), "version lock matches");
  check(
    E06_AUTONOMOUS_LAYER_VERSION_LOCK.signoff.length > 0,
    "signoff version in lock",
  );
  check(
    E06_AUTONOMOUS_LAYER_VERSION_LOCK.operation === "e06-operation-1",
    "P1 operation lock",
  );
  check(
    E06_AUTONOMOUS_LAYER_VERSION_LOCK.agent === "e06-agent-1",
    "P7 agent lock",
  );
  check(
    E06_AUTONOMOUS_LAYER_VERSION_LOCK.agentFreeze === "e06-agent-freeze-1",
    "P7 freeze lock",
  );
  check(
    E06_AUTONOMOUS_LAYER_VERSION_LOCK.twin === "e06-twin-1",
    "P6 twin lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildAutonomousFreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.agentBaseline.ready, "P7 agent baseline ready");
  check(freeze.agentBaseline.directiveCount === 4, "agent directives");
  check(freeze.agentBaseline.agentId === "e06.agent.growth", "baseline agent");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ autonomous freeze manifest");
}

function testSignoffReport() {
  const incomplete = runAutonomousSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(
    !incomplete.signoffState.signedOff,
    "broken version lock not signed off",
  );

  const ready = buildAutonomousSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeE06AutonomousEnterpriseOS({
    deploymentId: DEPLOYMENT_ID,
  });

  check(ready.version === E06_AUTONOMOUS_SIGNOFF_VERSION, "signoff version");
  check(
    ready.freeze.version === E06_AUTONOMOUS_OS_FREEZE_VERSION,
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
    "closeE06AutonomousEnterpriseOS signed off",
  );
  assertAutonomousSignoffPass(ready);

  const readiness = collectAutonomousPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "EA-P8", "P8 gate id");

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
    boundary[0]?.snapshotPath === "lib/intelligence/e05/",
    "E05 boundary protected",
  );

  console.log("✓ autonomous sign-off report");
  console.log(formatAutonomousSignoffSummary(ready));
}

function main() {
  console.log(
    "E06-P8 — Autonomous Enterprise OS Governance Freeze Verification\n",
  );
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log(
    "\nPASS — E06 P8 governance (P1–P7 frozen autonomous enterprise OS baseline)",
  );
  console.log("CLOSED — E06 Autonomous Enterprise OS");
}

main();
