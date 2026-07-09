/**
 * V67 P1 — Monitoring & Incident Response Foundation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ALERT_RULE_CATALOG,
  INCIDENT_EVENT_CATALOG,
  MONITORING_FOUNDATION_CONTRACT_IDS,
  ONCALL_ROTATION_CATALOG,
  SLI_CATALOG,
  SLO_CATALOG,
  V67_MONITORING_ARTIFACT_SURFACE,
  V67_MONITORING_FOUNDATION_VERSION,
  V67_UPSTREAM_FROZEN_MONITORING_LOCK,
  assertMonitoringFoundationPass,
  buildAlertContractManifest,
  buildEventContractManifest,
  buildMonitoringFoundationReport,
  buildOncallContractManifest,
  buildSloContractManifest,
  formatMonitoringFoundationSummary,
  isUpstreamFrozenMonitoringLockIntact,
  runMonitoringFoundation,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p1-monitoring-foundation";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/index.ts",
    "lib/monitoring/v67/foundation.ts",
    "lib/monitoring/v67/foundation.types.ts",
    "lib/monitoring/v67/foundation.constants.ts",
    "lib/monitoring/v67/foundation.surface.ts",
    "lib/monitoring/v67/foundation.builder.ts",
    "lib/monitoring/v67/foundation.entry.ts",
    "lib/monitoring/v67/alert.contract.ts",
    "lib/monitoring/v67/event.contract.ts",
    "lib/monitoring/v67/slo.contract.ts",
    "lib/monitoring/v67/oncall.contract.ts",
    "docs/monitoring/V67-MONITORING-FOUNDATION.md",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 monitoring foundation module structure");
}

function testInventories() {
  assert(ALERT_RULE_CATALOG.length >= 8, "alert rule catalog");
  assert(INCIDENT_EVENT_CATALOG.length >= 8, "incident event catalog");
  assert(SLI_CATALOG.length >= 5, "SLI catalog");
  assert(SLO_CATALOG.length >= 5, "SLO catalog");
  assert(ONCALL_ROTATION_CATALOG.length >= 6, "on-call catalog");
  assert(MONITORING_FOUNDATION_CONTRACT_IDS.length === 4, "contract ids");
  console.log("✓ alert, event, slo & oncall inventories");
}

function testContracts() {
  const alerts = buildAlertContractManifest();
  assert(alerts.contractComplete, "alert contract complete");

  const events = buildEventContractManifest();
  assert(events.contractComplete, "event contract complete");

  const slo = buildSloContractManifest();
  assert(slo.contractComplete, "slo contract complete");
  assert(slo.slos.every((s) => slo.slis.some((i) => i.id === s.sliRef)), "slo sli refs");

  const oncall = buildOncallContractManifest();
  assert(oncall.contractComplete, "oncall contract complete");

  assert(isUpstreamFrozenMonitoringLockIntact(), "upstream frozen lock intact");
  assert(V67_UPSTREAM_FROZEN_MONITORING_LOCK.v66DeploymentSignoff.length > 0, "v66 signoff ref");
  console.log("✓ all four contracts & upstream lock");
}

function testReport() {
  const incomplete = runMonitoringFoundation({
    deploymentId: DEPLOYMENT_ID,
    signals: { v66DeploymentClosed: false },
  });
  assert(!incomplete.foundationReady, "incomplete upstream signal not ready");

  const ready = buildMonitoringFoundationReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V67_MONITORING_FOUNDATION_VERSION, "foundation version");
  assert(ready.contractsComplete, "all contracts complete");
  assert(ready.foundationReady, "foundation ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertMonitoringFoundationPass(ready);

  assert(
    V67_MONITORING_ARTIFACT_SURFACE.verifyFoundation.includes("verify:v67-p1"),
    "artifact surface verify script",
  );

  console.log("✓ monitoring foundation report");
  console.log(formatMonitoringFoundationSummary(ready));
  console.log("\n✅ V67 P1 Monitoring & Incident Response Foundation — verify PASS");
}

function main() {
  console.log("V67 P1 Monitoring & Incident Response Foundation Verification\n");
  checkModuleStructure();
  testInventories();
  testContracts();
  testReport();
}

main();
