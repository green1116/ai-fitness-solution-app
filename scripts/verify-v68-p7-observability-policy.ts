/**
 * V68 P7 — Observability Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ALERT_MAPPING_CATALOG,
  LOG_CATALOG,
  METRIC_CATALOG,
  TRACE_CATALOG,
  V68_OBSERVABILITY_POLICY_ARTIFACT_SURFACE,
  V68_OBSERVABILITY_POLICY_VERSION,
  V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P7,
  assertObservabilityPolicyPass,
  buildAlertMappingManifest,
  buildLogCatalogManifest,
  buildMetricCatalogManifest,
  buildObservabilityPolicyReport,
  buildTraceCatalogManifest,
  computeDeclarativeSamplingBudget,
  formatObservabilityPolicySummary,
  getAlertMappingsByServiceRef,
  getAlertMappingsBySourceKind,
  getLogsByServiceRef,
  getMetricsByServiceRef,
  getTracesByServiceRef,
  isObservabilityPolicyRefsAligned,
  isUpstreamPlatformGovernanceLockP7Intact,
  runObservabilityPolicy,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p7-observability-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/observability-policy/observability-policy.ts",
    "lib/platform/v68/observability-policy/governance.types.ts",
    "lib/platform/v68/observability-policy/governance.constants.ts",
    "lib/platform/v68/observability-policy/governance.surface.ts",
    "lib/platform/v68/observability-policy/governance.builder.ts",
    "lib/platform/v68/observability-policy/governance.entry.ts",
    "lib/platform/v68/observability-policy/metric.catalog.ts",
    "lib/platform/v68/observability-policy/log.catalog.ts",
    "lib/platform/v68/observability-policy/trace.catalog.ts",
    "lib/platform/v68/observability-policy/alert.mapping.catalog.ts",
    "lib/platform/v68/observability-policy/alignment.catalog.ts",
    "docs/platform/V68-OBSERVABILITY-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 observability policy module structure");
}

function testInventories() {
  check(METRIC_CATALOG.length >= 6, "metric catalog");
  check(LOG_CATALOG.length >= 6, "log catalog");
  check(TRACE_CATALOG.length >= 6, "trace catalog");
  check(ALERT_MAPPING_CATALOG.length >= 6, "alert mapping catalog");
  check(isUpstreamPlatformGovernanceLockP7Intact(), "upstream platform lock P7 intact");
  console.log("✓ metrics, logs, traces, alert mappings & upstream lock");
}

function testCrossReferences() {
  check(isObservabilityPolicyRefsAligned(), "observability policy refs aligned");

  const apiMetrics = getMetricsByServiceRef("SVC-DEF-001");
  check(apiMetrics.length >= 2, "SVC-DEF-001 metrics");

  const apiLogs = getLogsByServiceRef("SVC-DEF-001");
  check(apiLogs.length >= 2, "SVC-DEF-001 logs");

  const apiTraces = getTracesByServiceRef("SVC-DEF-001");
  check(apiTraces.length >= 2, "SVC-DEF-001 traces");

  const apiMappings = getAlertMappingsByServiceRef("SVC-DEF-001");
  check(apiMappings.length >= 2, "SVC-DEF-001 alert mappings");

  const metricMappings = getAlertMappingsBySourceKind("metric");
  check(metricMappings.length >= 3, "metric alert mappings");

  check(computeDeclarativeSamplingBudget(0.1), "sampling budget valid");
  check(!computeDeclarativeSamplingBudget(1.5), "sampling budget invalid");

  check(
    V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P7.reliabilityPolicy.length > 0,
    "P6 reliability version in lock",
  );
  console.log("✓ cross-references, sampling budget & P1–P6 upstream");
}

function testManifests() {
  check(buildMetricCatalogManifest().catalogComplete, "metric manifest complete");
  check(buildLogCatalogManifest().catalogComplete, "log manifest complete");
  check(buildTraceCatalogManifest().catalogComplete, "trace manifest complete");
  check(buildAlertMappingManifest().catalogComplete, "alert mapping manifest complete");
  console.log("✓ observability policy manifests");
}

function testReport() {
  const incomplete = runObservabilityPolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { reliabilityPolicyReady: false },
  });
  check(!incomplete.policyReady, "incomplete reliability policy not ready");

  const ready = buildObservabilityPolicyReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_OBSERVABILITY_POLICY_VERSION, "policy version");
  check(ready.reliabilityPolicyReady, "reliability policy ready");
  check(ready.metrics.catalogComplete, "metrics complete");
  check(ready.logs.catalogComplete, "logs complete");
  check(ready.traces.catalogComplete, "traces complete");
  check(ready.alertMappings.catalogComplete, "alert mappings complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertObservabilityPolicyPass(ready);

  check(
    V68_OBSERVABILITY_POLICY_ARTIFACT_SURFACE.verifyPolicy.includes("verify:v68-p7"),
    "artifact surface verify script",
  );

  console.log("✓ observability policy report");
  console.log(formatObservabilityPolicySummary(ready));
  console.log("\n✅ V68 P7 Observability Policy — verify PASS");
}

function main() {
  console.log("V68 P7 Observability Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
