/**
 * V68 P8 — Platform Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  RELEASE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V68_PLATFORM_LAYER_VERSION_LOCK,
  V68_PLATFORM_SIGNOFF_ARTIFACT_SURFACE,
  V68_PLATFORM_SIGNOFF_VERSION,
  assertPlatformSignoffPass,
  buildFreezeChecklistManifest,
  buildPlatformFreezeManifest,
  buildPlatformSignoffReport,
  buildReleaseGateSummary,
  buildRollbackSnapshotIndex,
  closeV68Platform,
  collectPlatformPhaseReadiness,
  formatPlatformSignoffSummary,
  isPlatformLayerVersionLockIntact,
  platformVersionLockMatchesExpected,
  runPlatformSignoff,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p8-platform-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/signoff/signoff.ts",
    "lib/platform/v68/signoff/signoff.types.ts",
    "lib/platform/v68/signoff/signoff.artifacts.ts",
    "lib/platform/v68/signoff/signoff.builder.ts",
    "lib/platform/v68/signoff/signoff.entry.ts",
    "lib/platform/v68/signoff/signoff.summary.ts",
    "lib/platform/v68/signoff/freeze.lock.ts",
    "lib/platform/v68/signoff/freeze.checklist.ts",
    "lib/platform/v68/signoff/freeze.manifest.ts",
    "lib/platform/v68/signoff/release.gate.summary.ts",
    "lib/platform/v68/signoff/rollback.snapshot.index.ts",
    "lib/platform/v68/signoff/readiness.collector.ts",
    "docs/platform/V68-PLATFORM-SIGNOFF.md",
    "docs/platform/V68-PLATFORM-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 platform sign-off module structure");
}

function testInventories() {
  check(RELEASE_GATE_CATALOG.length === 8, "release gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isPlatformLayerVersionLockIntact(), "version lock intact");
  check(platformVersionLockMatchesExpected(), "version lock matches expected");
  check(V68_PLATFORM_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  console.log("✓ release gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildPlatformFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.frozen, "freeze manifest frozen");
  console.log("✓ platform freeze manifest");
}

function testSignoffReport() {
  const incomplete = runPlatformSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signedOff, "broken version lock not signed off");

  const ready = buildPlatformSignoffReport({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV68Platform({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_PLATFORM_SIGNOFF_VERSION, "signoff version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.releaseGates.allGatesPass, "all release gates pass");
  check(ready.allPhasesPass, "all phases pass");
  check(ready.signedOff, "signed off");
  check(ready.finalReadinessScore === 100, "readiness score 100");
  check(closed.signedOff, "closeV68Platform signed off");
  assertPlatformSignoffPass(ready);

  const readiness = collectPlatformPhaseReadiness(DEPLOYMENT_ID);
  const gates = buildReleaseGateSummary(readiness);
  check(gates.gateCount === 8, "release gate summary count");

  const checklist = buildFreezeChecklistManifest({
    platformReady: true,
    versionLockIntact: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  check(
    V68_PLATFORM_SIGNOFF_ARTIFACT_SURFACE.verifySignoff.includes("verify:v68-p8"),
    "artifact surface verify script",
  );

  console.log("✓ platform sign-off report");
  console.log(formatPlatformSignoffSummary(ready));
  console.log("\n✅ V68 P8 Platform Sign-off & Freeze — verify PASS");
  console.log("✅ V68 Platform Governance — CLOSED");
}

function main() {
  console.log("V68 P8 Platform Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
