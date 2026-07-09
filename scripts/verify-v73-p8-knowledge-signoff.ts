/**
 * V73 P8 — Knowledge Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildKnowledgeFreezeManifest,
  buildKnowledgeSignoff,
  buildRollbackSnapshotIndex,
  closeV73Knowledge,
  collectKnowledgePhaseReadiness,
  formatKnowledgeSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isKnowledgeLayerVersionLockIntact,
  KNOWLEDGE_GATE_CATALOG,
  knowledgeVersionLockMatchesExpected,
  ROLLBACK_SNAPSHOT_INDEX,
  runKnowledgeSignoff,
  V73_KNOWLEDGE_FREEZE_VERSION,
  V73_KNOWLEDGE_LAYER_VERSION_LOCK,
  V73_KNOWLEDGE_SIGNOFF_VERSION,
} from "../lib/knowledge/v73/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p8-knowledge-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/signoff/signoff.types.ts",
    "lib/knowledge/v73/signoff/freeze.lock.ts",
    "lib/knowledge/v73/signoff/freeze.checklist.ts",
    "lib/knowledge/v73/signoff/release.gate.summary.ts",
    "lib/knowledge/v73/signoff/rollback.snapshot.index.ts",
    "lib/knowledge/v73/signoff/readiness.collector.ts",
    "lib/knowledge/v73/signoff/signoff.manifest.ts",
    "lib/knowledge/v73/signoff/signoff.builder.ts",
    "lib/knowledge/v73/signoff/signoff.entry.ts",
    "docs/V73-P8-KNOWLEDGE-SIGNOFF-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge sign-off module structure");
}

function testInventories() {
  check(KNOWLEDGE_GATE_CATALOG.length === 8, "knowledge gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isKnowledgeLayerVersionLockIntact(), "version lock intact");
  check(knowledgeVersionLockMatchesExpected(), "version lock matches expected");
  check(V73_KNOWLEDGE_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V73_KNOWLEDGE_LAYER_VERSION_LOCK.knowledgeCompliance.length > 0, "P7 in lock");
  check(
    V73_KNOWLEDGE_LAYER_VERSION_LOCK.upstreamV72IntelligenceSignoff ===
      "v72-intelligence-signoff-1",
    "upstream V72 signoff lock",
  );
  check(
    V73_KNOWLEDGE_LAYER_VERSION_LOCK.upstreamV72IntelligenceFreeze ===
      "v72-intelligence-freeze-1",
    "upstream V72 freeze lock",
  );
  console.log("✓ knowledge gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildKnowledgeFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.knowledgeCompliance.complianceReady, "P7 compliance ready in freeze");
  check(freeze.freezeState.frozen, "freeze manifest frozen");
  console.log("✓ knowledge freeze manifest");
}

function testSignoffReport() {
  const incomplete = runKnowledgeSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signoffState.signedOff, "broken version lock not signed off");

  const ready = buildKnowledgeSignoff({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV73Knowledge({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V73_KNOWLEDGE_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V73_KNOWLEDGE_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all knowledge gates pass");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeV73Knowledge signed off");
  assertKnowledgeSignoffPass(ready);

  const readiness = collectKnowledgePhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");

  const checklist = buildFreezeChecklistManifest({
    knowledgeReady: true,
    versionLockIntact: true,
    knowledgeGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ knowledge sign-off report");
  console.log(formatKnowledgeSignoffSummary(ready));
  console.log("\n✅ V73 P8 Knowledge Sign-off & Freeze — verify PASS");
  console.log("✅ V73 Knowledge Retrieval — CLOSED");
}

function main() {
  console.log("V73 P8 Knowledge Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
