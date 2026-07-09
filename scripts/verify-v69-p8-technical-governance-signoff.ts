/**
 * V69 P8 — Technical Governance Sign-off & Freeze Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  RELEASE_GATE_CATALOG,
  ROLLBACK_SNAPSHOT_INDEX,
  V69_TECHNICAL_GOVERNANCE_SIGNOFF_ARTIFACT_SURFACE,
  V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION,
  V69_TECHNICAL_LAYER_VERSION_LOCK,
  assertTechnicalSignoffPass,
  buildFreezeChecklistManifest,
  buildReleaseGateSummary,
  buildRollbackSnapshotIndex,
  buildTechnicalFreezeManifest,
  buildTechnicalSignoffReport,
  closeV69TechnicalGovernance,
  collectTechnicalPhaseReadiness,
  formatTechnicalSignoffSummary,
  getReleaseGateByPhase,
  getRollbackSnapshotByLayer,
  isTechnicalLayerVersionLockIntact,
  runTechnicalSignoff,
  technicalVersionLockMatchesExpected,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p8-technical-governance-signoff";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/signoff/signoff.ts",
    "lib/technical-governance/v69/signoff/signoff.types.ts",
    "lib/technical-governance/v69/signoff/signoff.artifacts.ts",
    "lib/technical-governance/v69/signoff/signoff.builder.ts",
    "lib/technical-governance/v69/signoff/signoff.entry.ts",
    "lib/technical-governance/v69/signoff/signoff.summary.ts",
    "lib/technical-governance/v69/signoff/freeze.lock.ts",
    "lib/technical-governance/v69/signoff/freeze.checklist.ts",
    "lib/technical-governance/v69/signoff/freeze.manifest.ts",
    "lib/technical-governance/v69/signoff/release.gate.summary.ts",
    "lib/technical-governance/v69/signoff/rollback.snapshot.index.ts",
    "lib/technical-governance/v69/signoff/readiness.collector.ts",
    "docs/technical-governance/V69-TECHNICAL-GOVERNANCE-SIGNOFF.md",
    "docs/technical-governance/V69-TECHNICAL-GOVERNANCE-FREEZE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 technical governance sign-off module structure");
}

function testInventories() {
  check(RELEASE_GATE_CATALOG.length === 8, "release gate catalog P1–P8");
  check(ROLLBACK_SNAPSHOT_INDEX.length >= 10, "rollback snapshot index");
  check(isTechnicalLayerVersionLockIntact(), "version lock intact");
  check(technicalVersionLockMatchesExpected(), "version lock matches expected");
  check(V69_TECHNICAL_LAYER_VERSION_LOCK.signoff.length > 0, "signoff version in lock");
  check(V69_TECHNICAL_LAYER_VERSION_LOCK.architectureCompliance.length > 0, "P7 in lock");
  console.log("✓ release gates, rollback index & version lock");
}

function testFreezeManifest() {
  const freeze = buildTechnicalFreezeManifest({ deploymentId: DEPLOYMENT_ID });
  check(freeze.versionLockOk, "freeze version lock ok");
  check(freeze.rollbackSnapshot.indexComplete, "rollback index complete");
  check(freeze.freezeChecklist.checklistPass, "freeze checklist pass");
  check(freeze.architectureCompliance.complianceReady, "P7 compliance ready in freeze");
  check(freeze.frozen, "freeze manifest frozen");
  console.log("✓ technical governance freeze manifest");
}

function testSignoffReport() {
  const incomplete = runTechnicalSignoff({
    deploymentId: DEPLOYMENT_ID,
    signals: { versionLockIntact: false },
  });
  check(!incomplete.signedOff, "broken version lock not signed off");

  const ready = buildTechnicalSignoffReport({ deploymentId: DEPLOYMENT_ID });
  const closed = closeV69TechnicalGovernance({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION, "signoff version");
  check(ready.phases.length === 8, "eight phases");
  check(ready.releaseGates.allGatesPass, "all release gates pass");
  check(ready.allPhasesPass, "all phases pass");
  check(ready.signedOff, "signed off");
  check(ready.finalReadinessScore === 100, "readiness score 100");
  check(closed.signedOff, "closeV69TechnicalGovernance signed off");
  assertTechnicalSignoffPass(ready);

  const readiness = collectTechnicalPhaseReadiness(DEPLOYMENT_ID);
  check(readiness.p1 && readiness.p7, "P1 and P7 readiness");

  const gates = buildReleaseGateSummary(readiness);
  check(gates.gateCount === 8, "release gate summary count");

  const p8Gate = getReleaseGateByPhase("P8");
  check(p8Gate?.ok === true, "P8 release gate ok");

  const checklist = buildFreezeChecklistManifest({
    governanceReady: true,
    versionLockIntact: true,
    releaseGatesPass: true,
    rollbackSnapshotComplete: true,
  });
  check(checklist.checklistPass, "freeze checklist");

  const snapshot = buildRollbackSnapshotIndex();
  check(snapshot.indexComplete, "snapshot index");

  const p7Rollback = getRollbackSnapshotByLayer("P7");
  check(p7Rollback.length >= 1, "P7 rollback snapshot");

  check(
    V69_TECHNICAL_GOVERNANCE_SIGNOFF_ARTIFACT_SURFACE.verifySignoff.includes("verify:v69-p8"),
    "artifact surface verify script",
  );
  check(
    V69_TECHNICAL_GOVERNANCE_SIGNOFF_ARTIFACT_SURFACE.verifyTechnicalGovernance.includes(
      "verify:v69-technical-governance",
    ),
    "artifact surface full chain",
  );

  console.log("✓ technical governance sign-off report");
  console.log(formatTechnicalSignoffSummary(ready));
  console.log("\n✅ V69 P8 Technical Governance Sign-off & Freeze — verify PASS");
  console.log("✅ V69 Technical Governance — CLOSED");
}

function main() {
  console.log("V69 P8 Technical Governance Sign-off & Freeze Verification\n");
  checkModuleStructure();
  testInventories();
  testFreezeManifest();
  testSignoffReport();
}

main();
