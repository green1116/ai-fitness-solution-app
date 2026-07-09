/**
 * V66 P8 — Deployment Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  RELEASE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V66_DEPLOYMENT_LAYER_VERSION_LOCK,
  V66_DEPLOYMENT_SIGNOFF_VERSION,
  V66_SIGNOFF_ARTIFACT_SURFACE,
  assertDeploymentSignoffPass,
  buildDeploymentFreezeManifest,
  buildDeploymentSignoffReport,
  buildFreezeChecklistManifest,
  buildReleaseGateSummary,
  buildRollbackSnapshotIndex,
  closeV66Deployment,
  deploymentVersionLockMatchesExpected,
  formatDeploymentSignoffSummary,
  isDeploymentLayerVersionLockIntact,
  runDeploymentSignoff,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p8-deployment-signoff";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/signoff.ts",
    "lib/deployment/v66/signoff.types.ts",
    "lib/deployment/v66/signoff.artifacts.ts",
    "lib/deployment/v66/signoff.builder.ts",
    "lib/deployment/v66/signoff.entry.ts",
    "lib/deployment/v66/signoff.summary.ts",
    "lib/deployment/v66/freeze.lock.ts",
    "lib/deployment/v66/freeze.checklist.ts",
    "lib/deployment/v66/freeze.manifest.ts",
    "lib/deployment/v66/release.gate.summary.ts",
    "lib/deployment/v66/rollback.snapshot.index.ts",
    "docs/deployment/V66-DEPLOYMENT-SIGNOFF.md",
    "docs/deployment/V66-DEPLOYMENT-FREEZE.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 deployment sign-off module structure");
}

function testInventories() {
  assert(RELEASE_GATE_CATALOG.length === 8, "release gate catalog P1–P8");
  assert(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  assert(isDeploymentLayerVersionLockIntact(), "version lock intact");
  assert(deploymentVersionLockMatchesExpected(), "version lock matches expected");
  assert(V66_DEPLOYMENT_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  console.log("✓ release gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildDeploymentFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  assert(freeze.versionLockOk, "freeze version lock ok");
  assert(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  assert(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  assert(freeze.frozen, "freeze manifest frozen");
  console.log("✓ deployment freeze manifest");
}

function testSignoffReport() {
  const incomplete = runDeploymentSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  assert(!incomplete.signedOff, "broken version lock not signed off");

  const ready = buildDeploymentSignoffReport({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV66Deployment({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_DEPLOYMENT_SIGNOFF_VERSION, "signoff version");
  assert(ready.phases.length === 8, "eight phases");
  assert(ready.releaseGates.allGatesPass, "all release gates pass");
  assert(ready.allPhasesPass, "all phases pass");
  assert(ready.signedOff, "signed off");
  assert(ready.finalReadinessScore === 100, "readiness score 100");
  assert(closed.signedOff, "closeV66Deployment signed off");
  assertDeploymentSignoffPass(ready);

  const gates = buildReleaseGateSummary(ready.freeze.ops);
  assert(gates.gateCount === 8, "release gate summary count");

  const checklist = buildFreezeChecklistManifest({ opsReady: true, versionLockIntact: true });
  assert(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  assert(snapshot.indexComplete, "snapshot index");

  assert(
    V66_SIGNOFF_ARTIFACT_SURFACE.verifySignoff.includes("verify:v66-p8"),
    "artifact surface verify script",
  );

  console.log("✓ deployment sign-off report");
  console.log(formatDeploymentSignoffSummary(ready));
  console.log("\n✅ V66 P8 Deployment Sign-off & Freeze — verify PASS");
  console.log("✅ V66 Deployment Readiness — CLOSED");
}

function main() {
  console.log("V66 P8 Deployment Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
