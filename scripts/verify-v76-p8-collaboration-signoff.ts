/**
 * V76 P8 — Collaboration Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  COLLABORATION_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V76_COLLABORATION_FREEZE_VERSION,
  V76_COLLABORATION_LAYER_VERSION_LOCK,
  V76_COLLABORATION_SIGNOFF_VERSION,
  assertCollaborationSignoffPass,
  buildCollaborationFreezeManifest,
  buildCollaborationSignoff,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildRollbackSnapshotIndex,
  closeV76Collaboration,
  collaborationVersionLockMatchesExpected,
  collectCollaborationPhaseReadiness,
  formatCollaborationSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isCollaborationLayerVersionLockIntact,
  runCollaborationSignoff,
} from "../lib/collaboration/v76/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v76-p8-collaboration-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/collaboration/v76/signoff/signoff.types.ts",
    "lib/collaboration/v76/signoff/freeze.lock.ts",
    "lib/collaboration/v76/signoff/freeze.checklist.ts",
    "lib/collaboration/v76/signoff/release.gate.summary.ts",
    "lib/collaboration/v76/signoff/rollback.snapshot.index.ts",
    "lib/collaboration/v76/signoff/readiness.collector.ts",
    "lib/collaboration/v76/signoff/signoff.manifest.ts",
    "lib/collaboration/v76/signoff/signoff.builder.ts",
    "lib/collaboration/v76/signoff/signoff.entry.ts",
    "docs/V76-COLLABORATION-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V76 collaboration sign-off module structure");
}

function testInventories() {
  check(COLLABORATION_GATE_CATALOG.length === 8, "collaboration gate catalog P1–P8");
  check(COLLABORATION_GATE_CATALOG[0]?.id === "COL-P1", "COL-P1 gate id");
  check(COLLABORATION_GATE_CATALOG[7]?.id === "COL-P8", "COL-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isCollaborationLayerVersionLockIntact(), "version lock intact");
  check(collaborationVersionLockMatchesExpected(), "version lock matches expected");
  check(V76_COLLABORATION_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V76_COLLABORATION_LAYER_VERSION_LOCK.collaborationCompliance.length > 0, "P7 in lock");
  check(
    V76_COLLABORATION_LAYER_VERSION_LOCK.upstreamV75AgentSignoff === "v75-agent-signoff-1",
    "upstream V75 signoff lock",
  );
  check(
    V76_COLLABORATION_LAYER_VERSION_LOCK.upstreamV75AgentFreeze === "v75-agent-freeze-1",
    "upstream V75 freeze lock",
  );
  console.log("✓ collaboration gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildCollaborationFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.collaborationCompliance.catalogReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ collaboration freeze manifest");
}

function testSignoffReport() {
  const incomplete = runCollaborationSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildCollaborationSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV76Collaboration({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V76_COLLABORATION_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V76_COLLABORATION_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all collaboration gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV76Collaboration signed off");
  assertCollaborationSignoffPass(ready);

  const readiness = collectCollaborationPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "COL-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    collaborationReady: true,
    versionLockIntact: true,
    collaborationGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ collaboration sign-off report");
  console.log(formatCollaborationSignoffSummary(ready));
  console.log("\n✅ V76 P8 Collaboration Sign-off & Freeze — verify PASS");
  console.log("✅ V76 Collaboration — CLOSED");
}

function main() {
  console.log("V76 P8 Collaboration Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
