/**
 * E04-P8 — Business Agent Governance Freeze Verification
 * Freeze E04 P1–P7 into enterprise business agent baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  BUSINESS_AGENT_GATE_CATALOG,
  E04_BUSINESS_AGENT_LAYER_VERSION_LOCK,
  E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
  E04_BUSINESS_AGENT_SIGNOFF_VERSION,
  ROLLBACK_SNAPSHOT_INDEX,
  assertBusinessAgentSignoffPass,
  buildBusinessAgentFreezeManifest,
  buildBusinessAgentSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  businessAgentVersionLockMatchesExpected,
  closeE04BusinessAgentPlatform,
  collectBusinessAgentPhaseReadiness,
  formatBusinessAgentSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isBusinessAgentLayerVersionLockIntact,
  runBusinessAgentSignoff,
} from "../lib/business-agent/e04/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "e04-p8-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/business-agent/e04/signoff/signoff.types.ts",
    "lib/business-agent/e04/signoff/freeze.lock.ts",
    "lib/business-agent/e04/signoff/freeze.checklist.ts",
    "lib/business-agent/e04/signoff/release.gate.summary.ts",
    "lib/business-agent/e04/signoff/rollback.snapshot.index.ts",
    "lib/business-agent/e04/signoff/readiness.collector.ts",
    "lib/business-agent/e04/signoff/signoff.manifest.ts",
    "lib/business-agent/e04/signoff/signoff.builder.ts",
    "lib/business-agent/e04/signoff/signoff.entry.ts",
    "docs/E04-BUSINESS-AGENT-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(BUSINESS_AGENT_GATE_CATALOG.length === 8, "gate catalog P1–P8");
  check(BUSINESS_AGENT_GATE_CATALOG[0]?.id === "BA-P1", "BA-P1 gate id");
  check(BUSINESS_AGENT_GATE_CATALOG[7]?.id === "BA-P8", "BA-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot 12 items");
  check(isBusinessAgentLayerVersionLockIntact(), "version lock intact");
  check(businessAgentVersionLockMatchesExpected(), "version lock matches");
  check(
    E04_BUSINESS_AGENT_LAYER_VERSION_LOCK.signoff.length > 0,
    "signoff version in lock",
  );
  check(
    E04_BUSINESS_AGENT_LAYER_VERSION_LOCK.collaboration ===
      "e04-collaboration-1",
    "P7 collaboration lock",
  );
  check(
    E04_BUSINESS_AGENT_LAYER_VERSION_LOCK.collaborationFreeze ===
      "e04-collaboration-freeze-1",
    "P7 freeze lock",
  );
  check(
    E04_BUSINESS_AGENT_LAYER_VERSION_LOCK.foundation === "e04-business-agent-1",
    "P1 foundation lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildBusinessAgentFreezeManifest({
    deploymentId: DEPLOYMENT_ID,
  });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.collaborationBaseline.ready, "P7 collaboration baseline ready");
  check(freeze.collaborationBaseline.phase === "closed", "baseline closed");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ business agent freeze manifest");
}

function testSignoffReport() {
  const incomplete = runBusinessAgentSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildBusinessAgentSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeE04BusinessAgentPlatform({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === E04_BUSINESS_AGENT_SIGNOFF_VERSION, "signoff version");
  check(
    ready.freeze.version === E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION,
    "freeze version",
  );
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeE04BusinessAgentPlatform signed off");
  assertBusinessAgentSignoffPass(ready);

  const readiness = collectBusinessAgentPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "BA-P8", "P8 gate id");

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

  console.log("✓ business agent sign-off report");
  console.log(formatBusinessAgentSignoffSummary(ready));
}

function main() {
  console.log("E04-P8 — Business Agent Governance Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log(
    "\nPASS — E04 P8 governance (P1–P7 frozen enterprise business agent baseline)",
  );
  console.log("CLOSED — E04 Enterprise Business Agent Platform");
}

main();
