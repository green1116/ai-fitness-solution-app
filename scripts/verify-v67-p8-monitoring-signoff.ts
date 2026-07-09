/**
 * V67 P8 — Monitoring Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  RELEASE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V67_MONITORING_LAYER_VERSION_LOCK,
  V67_MONITORING_SIGNOFF_ARTIFACT_SURFACE,
  V67_MONITORING_SIGNOFF_VERSION,
  assertMonitoringSignoffPass,
  buildFreezeChecklistManifest,
  buildMonitoringFreezeManifest,
  buildMonitoringSignoffReport,
  buildReleaseGateSummary,
  buildRollbackSnapshotIndex,
  closeV67Monitoring,
  collectMonitoringPhaseReadiness,
  formatMonitoringSignoffSummary,
  isMonitoringLayerVersionLockIntact,
  monitoringVersionLockMatchesExpected,
  runMonitoringSignoff,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p8-monitoring-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/signoff/signoff.ts",
    "lib/monitoring/v67/signoff/signoff.types.ts",
    "lib/monitoring/v67/signoff/signoff.artifacts.ts",
    "lib/monitoring/v67/signoff/signoff.builder.ts",
    "lib/monitoring/v67/signoff/signoff.entry.ts",
    "lib/monitoring/v67/signoff/signoff.summary.ts",
    "lib/monitoring/v67/signoff/freeze.lock.ts",
    "lib/monitoring/v67/signoff/freeze.checklist.ts",
    "lib/monitoring/v67/signoff/freeze.manifest.ts",
    "lib/monitoring/v67/signoff/release.gate.summary.ts",
    "lib/monitoring/v67/signoff/rollback.snapshot.index.ts",
    "lib/monitoring/v67/signoff/readiness.collector.ts",
    "docs/monitoring/V67-MONITORING-SIGNOFF.md",
    "docs/monitoring/V67-MONITORING-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 monitoring sign-off module structure");
}

function testInventories() {
  check(RELEASE_GATE_CATALOG.length === 8, "release gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isMonitoringLayerVersionLockIntact(), "version lock intact");
  check(monitoringVersionLockMatchesExpected(), "version lock matches expected");
  check(V67_MONITORING_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  console.log("✓ release gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildMonitoringFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.frozen, "freeze manifest frozen");
  console.log("✓ monitoring freeze manifest");
}

function testSignoffReport() {
  const incomplete = runMonitoringSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signedOff, "broken version lock not signed off");

  const ready = buildMonitoringSignoffReport({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV67Monitoring({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_MONITORING_SIGNOFF_VERSION, "signoff version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.releaseGates.allGatesPass, "all release gates pass");
  check(ready.allPhasesPass, "all phases pass");
  check(ready.signedOff, "signed off");
  check(ready.finalReadinessScore === 100, "readiness score 100");
  check(closed.signedOff, "closeV67Monitoring signed off");
  assertMonitoringSignoffPass(ready);

  const readiness = collectMonitoringPhaseReadiness(DEPLOYMENT_ID);
  const gates = buildReleaseGateSummary(readiness);
  check(gates.gateCount === 8, "release gate summary count");

  const checklist = buildFreezeChecklistManifest({
    monitoringReady: true,
    versionLockIntact: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  check(
    V67_MONITORING_SIGNOFF_ARTIFACT_SURFACE.verifySignoff.includes("verify:v67-p8"),
    "artifact surface verify script",
  );

  console.log("✓ monitoring sign-off report");
  console.log(formatMonitoringSignoffSummary(ready));
  console.log("\n✅ V67 P8 Monitoring Sign-off & Freeze — verify PASS");
  console.log("✅ V67 Monitoring & Incident Response — CLOSED");
}

function main() {
  console.log("V67 P8 Monitoring Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
