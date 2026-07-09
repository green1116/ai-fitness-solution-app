/**
 * V75 P8 — Agent Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  AGENT_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V75_AGENT_FREEZE_VERSION,
  V75_AGENT_LAYER_VERSION_LOCK,
  V75_AGENT_SIGNOFF_VERSION,
  agentVersionLockMatchesExpected,
  assertAgentSignoffPass,
  buildAgentFreezeManifest,
  buildAgentSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeV75Agent,
  collectAgentPhaseReadiness,
  formatAgentSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isAgentLayerVersionLockIntact,
  runAgentSignoff,
} from "../lib/agent/v75/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v75-p8-agent-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/agent/v75/signoff/signoff.types.ts",
    "lib/agent/v75/signoff/freeze.lock.ts",
    "lib/agent/v75/signoff/freeze.checklist.ts",
    "lib/agent/v75/signoff/release.gate.summary.ts",
    "lib/agent/v75/signoff/rollback.snapshot.index.ts",
    "lib/agent/v75/signoff/readiness.collector.ts",
    "lib/agent/v75/signoff/signoff.manifest.ts",
    "lib/agent/v75/signoff/signoff.builder.ts",
    "lib/agent/v75/signoff/signoff.entry.ts",
    "docs/V75-AGENT-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V75 agent sign-off module structure");
}

function testInventories() {
  check(AGENT_GATE_CATALOG.length === 8, "agent gate catalog P1–P8");
  check(AGENT_GATE_CATALOG[0]?.id === "AG-P1", "AG-P1 gate id");
  check(AGENT_GATE_CATALOG[7]?.id === "AG-P8", "AG-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isAgentLayerVersionLockIntact(), "version lock intact");
  check(agentVersionLockMatchesExpected(), "version lock matches expected");
  check(V75_AGENT_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V75_AGENT_LAYER_VERSION_LOCK.agentCompliance.length > 0, "P7 in lock");
  check(
    V75_AGENT_LAYER_VERSION_LOCK.upstreamV74DecisionSignoff === "v74-decision-signoff-1",
    "upstream V74 signoff lock",
  );
  check(
    V75_AGENT_LAYER_VERSION_LOCK.upstreamV74DecisionFreeze === "v74-decision-freeze-1",
    "upstream V74 freeze lock",
  );
  console.log("✓ agent gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildAgentFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.agentCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ agent freeze manifest");
}

function testSignoffReport() {
  const incomplete = runAgentSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildAgentSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV75Agent({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V75_AGENT_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V75_AGENT_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all agent gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV75Agent signed off");
  assertAgentSignoffPass(ready);

  const readiness = collectAgentPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "AG-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    agentReady: true,
    versionLockIntact: true,
    agentGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ agent sign-off report");
  console.log(formatAgentSignoffSummary(ready));
  console.log("\n✅ V75 P8 Agent Sign-off & Freeze — verify PASS");
  console.log("✅ V75 Agent Orchestration Foundation — CLOSED");
}

function main() {
  console.log("V75 P8 Agent Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
