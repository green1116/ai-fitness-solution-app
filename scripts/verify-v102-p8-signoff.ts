/**
 * E02-P8 — Tender Knowledge Graph Sign-off & Freeze Verification
 * Freeze E02 P1–P7 into enterprise knowledge baseline
 */
import fs from "node:fs";
import path from "node:path";

import {
  KNOWLEDGE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V102_KNOWLEDGE_FREEZE_VERSION,
  V102_KNOWLEDGE_LAYER_VERSION_LOCK,
  V102_KNOWLEDGE_SIGNOFF_VERSION,
  assertKnowledgeSignoffPass,
  buildFreezeChecklistManifest,
  buildGateSummary,
  buildKnowledgeFreezeManifest,
  buildKnowledgeSignoff,
  buildRollbackSnapshotIndex,
  closeE02TenderKnowledgeGraph,
  collectKnowledgePhaseReadiness,
  formatKnowledgeSignoffSummary,
  getGateSummaryByPhase,
  getRollbackSnapshotByLayer,
  isKnowledgeLayerVersionLockIntact,
  knowledgeVersionLockMatchesExpected,
  runKnowledgeSignoff,
} from "../lib/tender-intelligence/v102/signoff/signoff.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p8-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-intelligence/v102/signoff/signoff.types.ts",
    "lib/tender-intelligence/v102/signoff/freeze.lock.ts",
    "lib/tender-intelligence/v102/signoff/freeze.checklist.ts",
    "lib/tender-intelligence/v102/signoff/release.gate.summary.ts",
    "lib/tender-intelligence/v102/signoff/rollback.snapshot.index.ts",
    "lib/tender-intelligence/v102/signoff/readiness.collector.ts",
    "lib/tender-intelligence/v102/signoff/signoff.manifest.ts",
    "lib/tender-intelligence/v102/signoff/signoff.builder.ts",
    "lib/tender-intelligence/v102/signoff/signoff.entry.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testInventories() {
  check(KNOWLEDGE_GATE_CATALOG.length === 8, "knowledge gate catalog P1–P8");
  check(KNOWLEDGE_GATE_CATALOG[0]?.id === "KG-P1", "KG-P1 gate id");
  check(KNOWLEDGE_GATE_CATALOG[7]?.id === "KG-P8", "KG-P8 gate id");
  check(ROLLBACK_SNAPSHOT_INDEX.length === 12, "rollback snapshot index 12 items");
  check(isKnowledgeLayerVersionLockIntact(), "version lock intact");
  check(knowledgeVersionLockMatchesExpected(), "version lock matches expected");
  check(V102_KNOWLEDGE_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V102_KNOWLEDGE_LAYER_VERSION_LOCK.knowledgeDelivery.length > 0, "P7 in lock");
  check(
    V102_KNOWLEDGE_LAYER_VERSION_LOCK.knowledge === "v102-tender-knowledge-1",
    "P1 knowledge lock",
  );
  check(
    V102_KNOWLEDGE_LAYER_VERSION_LOCK.knowledgeDeliveryFreeze ===
      "v102-knowledge-delivery-freeze-1",
    "P7 delivery freeze lock",
  );
  console.log("✓ gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildKnowledgeFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.rollbackSnapshot.entryCount === 12, "rollback 12 entries");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.freezeChecklist.itemCount === 10, "freeze checklist 10 items");
  check(freeze.deliveryBaseline.ready, "P7 knowledge delivery baseline ready");
  check(freeze.deliveryBaseline.sealHash !== null, "delivery seal hash");
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
  const closed = closeE02TenderKnowledgeGraph({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V102_KNOWLEDGE_SIGNOFF_VERSION, "signoff version");
  check(ready.freeze.version === V102_KNOWLEDGE_FREEZE_VERSION, "freeze version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.gateSummary.allGatesPass, "all knowledge gates pass");
  check(ready.gateSummary.gateCount === 8, "eight gates");
  check(ready.signoffState.allPhasesPass, "all phases pass");
  check(ready.signoffState.signedOff, "signed off");
  check(ready.signoffState.finalReadinessScore === 100, "readiness score 100");
  check(ready.signoffState.state === "ready", "signoff state ready");
  check(closed.signoffState.signedOff, "closeE02TenderKnowledgeGraph signed off");
  assertKnowledgeSignoffPass(ready);

  const readiness = collectKnowledgePhaseReadiness(DEPLOYMENT_ID);
  check(readiness.ready, "readiness report ready");
  check(!readiness.blocked, "readiness not blocked");

  const gates = buildGateSummary(readiness);
  check(gates.gateCount === 8, "gate summary count");

  const p8Gate = getGateSummaryByPhase("P8");
  check(p8Gate?.ok === true, "P8 gate ok");
  check(p8Gate?.id === "KG-P8", "P8 gate id");

  const checklist = buildFreezeChecklistManifest({
    knowledgeReady: true,
    versionLockIntact: true,
    knowledgeGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");
  check(checklist.itemCount === 10, "checklist 10 items");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");
  check(snapshot.entryCount === 12, "snapshot 12 entries");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  console.log("✓ knowledge sign-off report");
  console.log(formatKnowledgeSignoffSummary(ready));
}

function main() {
  console.log(
    "E02-P8 — Tender Knowledge Graph Sign-off & Freeze Verification\n",
  );
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
  console.log("\nPASS — V102 P8 signoff (P1–P7 frozen enterprise knowledge baseline)");
  console.log("CLOSED — E02 Enterprise Tender Knowledge Graph");
}

main();
