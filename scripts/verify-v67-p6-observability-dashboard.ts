/**
 * V67 P6 — Observability Dashboard Contracts Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DASHBOARD_CATALOG,
  METRIC_VIEW_CATALOG,
  SERVICE_HEALTH_CATALOG,
  STATUS_SUMMARY_CATALOG,
  V67_OBSERVABILITY_DASHBOARD_ARTIFACT_SURFACE,
  V67_OBSERVABILITY_DASHBOARD_VERSION,
  assertObservabilityDashboardPass,
  buildDashboardCatalogManifest,
  buildMetricViewManifest,
  buildObservabilityDashboardReport,
  buildServiceHealthManifest,
  buildStatusSummaryManifest,
  computeDeclarativeHealthScore,
  formatObservabilityDashboardSummary,
  getDashboardById,
  getDashboardsByKind,
  getMetricViewsBySliRef,
  getServiceHealthById,
  getStatusSummaryByScope,
  isAlertTypeRefsAligned,
  isDashboardRefsAligned,
  isSloRefsAligned,
  runObservabilityDashboard,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p6-observability-dashboard";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/observability/observability.ts",
    "lib/monitoring/v67/observability/governance.types.ts",
    "lib/monitoring/v67/observability/governance.surface.ts",
    "lib/monitoring/v67/observability/governance.builder.ts",
    "lib/monitoring/v67/observability/governance.entry.ts",
    "lib/monitoring/v67/observability/dashboard.catalog.ts",
    "lib/monitoring/v67/observability/service.health.catalog.ts",
    "lib/monitoring/v67/observability/metric.view.catalog.ts",
    "lib/monitoring/v67/observability/status.summary.contract.ts",
    "docs/monitoring/V67-OBSERVABILITY-DASHBOARD.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 observability dashboard module structure");
}

function testInventories() {
  check(DASHBOARD_CATALOG.length >= 6, "dashboard catalog");
  check(SERVICE_HEALTH_CATALOG.length >= 6, "service health catalog");
  check(METRIC_VIEW_CATALOG.length >= 6, "metric view catalog");
  check(STATUS_SUMMARY_CATALOG.length >= 6, "status summary catalog");
  console.log("✓ dashboard, service health, metric view & status summary inventories");
}

function testCrossReferences() {
  check(isSloRefsAligned(), "SLO/SLI refs aligned");
  check(isDashboardRefsAligned(), "dashboard refs aligned");
  check(isAlertTypeRefsAligned(), "alert type refs aligned");

  const overview = getDashboardById("DBD-001");
  check(overview?.kind === "overview", "DBD-001 overview dashboard");

  const sloViews = getMetricViewsBySliRef("SLIT-001");
  check(sloViews.length >= 1, "SLIT-001 metric views");

  const sh001 = getServiceHealthById("SH-001");
  check(sh001?.sloRef === "SLOT-001", "SH-001 SLO mapping");

  const globalSummaries = getStatusSummaryByScope("global");
  check(globalSummaries.length >= 1, "global status summaries");

  const sloDashboards = getDashboardsByKind("slo");
  check(sloDashboards.length >= 1, "SLO kind dashboards");

  const health = computeDeclarativeHealthScore({
    availabilityPercent: 99.95,
    errorRatePercent: 0.05,
    sloObjectivePercent: 99.9,
  });
  check(health.status === "healthy", "declarative health score healthy");
  console.log("✓ cross-references & upstream alignment");
}

function testManifests() {
  check(buildDashboardCatalogManifest().catalogComplete, "dashboard catalog complete");
  check(buildServiceHealthManifest().catalogComplete, "service health complete");
  check(buildMetricViewManifest().catalogComplete, "metric views complete");
  check(buildStatusSummaryManifest().contractComplete, "status summary complete");
  console.log("✓ observability manifests");
}

function testReport() {
  const incomplete = runObservabilityDashboard({
    deploymentId: DEPLOYMENT_ID,
    signals: { oncallGovernanceReady: false },
  });
  check(!incomplete.contractsReady, "incomplete oncall governance not ready");

  const ready = buildObservabilityDashboardReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_OBSERVABILITY_DASHBOARD_VERSION, "dashboard version");
  check(ready.oncallGovernanceReady, "oncall governance ready");
  check(ready.dashboardCatalog.catalogComplete, "dashboard catalog complete");
  check(ready.serviceHealth.catalogComplete, "service health complete");
  check(ready.metricViews.catalogComplete, "metric views complete");
  check(ready.statusSummary.contractComplete, "status summary complete");
  check(ready.contractsReady, "contracts ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertObservabilityDashboardPass(ready);

  check(
    V67_OBSERVABILITY_DASHBOARD_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v67-p6"),
    "artifact surface verify script",
  );

  console.log("✓ observability dashboard report");
  console.log(formatObservabilityDashboardSummary(ready));
  console.log("\n✅ V67 P6 Observability Dashboard Contracts — verify PASS");
}

function main() {
  console.log("V67 P6 Observability Dashboard Contracts Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
