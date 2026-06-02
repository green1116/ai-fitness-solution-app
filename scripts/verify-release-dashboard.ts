/**
 * V3.7-H3 Release Gate & Ops Dashboard Surface — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  PRODUCTION_DASHBOARD_VERSION,
  DASHBOARD_SNAPSHOT_VERSION,
  RELEASE_CONTROL_SUMMARY_VERSION,
  OPS_PANEL_MANIFEST_VERSION,
  buildProductionDashboardFoundation,
  buildDashboardSnapshot,
  buildReleaseControlSummary,
  buildOpsPanelManifest,
} from "../lib/commercialization/dashboard";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testDashboardSnapshot() {
  const snapshot = buildDashboardSnapshot({ deploymentId: "h3-dash" });
  assert(snapshot.version === DASHBOARD_SNAPSHOT_VERSION, "snapshot version");
  assert(snapshot.buildStatus === "pass", "build pass");
  assert(snapshot.tscStatus === "pass", "tsc pass");
  assert(snapshot.verificationStatus === "pass", "verification pass");
  assert(snapshot.freezeStatus === "intact", "freeze intact");
  assert(snapshot.hardeningStatus === "pass", "hardening pass");
  assert(snapshot.observabilityStatus === "pass", "observability pass");
  assert(snapshot.releaseConfidence >= 80, "release confidence");
  assert(snapshot.incidentLevel === "informational", "incident level");
  assert(snapshot.releasable === true, "releasable");

  console.log("✓ dashboard snapshot");
  console.log(" ", snapshot.summary);
}

function testReleaseControlSummary() {
  const control = buildReleaseControlSummary({ deploymentId: "h3-release" });
  assert(control.version === RELEASE_CONTROL_SUMMARY_VERSION, "control version");
  assert(control.releaseReady === true, "release ready");
  assert(control.blocked === false, "not blocked");
  assert(control.warningCount === 0, "no warnings");
  assert(control.confidenceScore >= 80, "confidence");
  assert(control.gateReason.length > 0, "gate reason");
  assert(control.opsNotes.length > 0, "ops notes");

  console.log("✓ release control summary");
  console.log(" ", control.summary);
  console.log(" ", control.gateReason);
}

function testOpsPanelManifest() {
  const panel = buildOpsPanelManifest({ deploymentId: "h3-panel" });
  assert(panel.version === OPS_PANEL_MANIFEST_VERSION, "panel version");
  assert(panel.BUILD_FREEZE_VERSION.length > 0, "freeze version");
  assert(panel.HARDENING_VERSION.length > 0, "hardening version");
  assert(panel.OBSERVABILITY_VERSION.length > 0, "observability version");
  assert(panel.DASHBOARD_VERSION.length > 0, "dashboard version");
  assert(panel.buildPassed === true, "build passed");
  assert(panel.tscPassed === true, "tsc passed");
  assert(panel.verificationPassed === true, "verification passed");
  assert(panel.hardeningPassed === true, "hardening passed");
  assert(panel.observabilityPassed === true, "observability passed");
  assert(panel.releaseReady === true, "release ready");
  assert(BUILD_FREEZE_MANIFEST.buildPassed, "freeze baseline");

  console.log("✓ ops panel manifest");
  console.log(" ", panel.summary);
}

function testDashboardFoundation() {
  const foundation = buildProductionDashboardFoundation({ deploymentId: "h3-foundation" });
  assert(foundation.version === PRODUCTION_DASHBOARD_VERSION, "foundation version");
  assert(foundation.snapshot.snapshotId.includes("DASH-V37H3"), "snapshot linked");
  assert(foundation.releaseControl.summaryId.includes("RC-V37H3"), "release control linked");
  assert(foundation.opsPanel.manifestId.includes("PANEL-V37H3"), "ops panel linked");
  assert(foundation.snapshot.releasable, "releasable");
  assert(foundation.opsPanel.releaseReady, "release ready");

  console.log("✓ production dashboard foundation");
  console.log(" ", foundation.summary);
}

function main() {
  testDashboardSnapshot();
  testReleaseControlSummary();
  testOpsPanelManifest();
  testDashboardFoundation();
  console.log("\nAll release dashboard checks passed.");
}

main();
