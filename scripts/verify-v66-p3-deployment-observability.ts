/**
 * V66 P3 — Deployment Observability Baseline Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DEPLOYMENT_LOG_EVENT_INVENTORY,
  DEPLOYMENT_LOG_SCHEMA_FIELDS,
  OBSERVABILITY_SURFACE,
  OPS_EVENT_CATALOG,
  V66_DEPLOYMENT_OBSERVABILITY_VERSION,
  V66_OBSERVABILITY_ARTIFACT_SURFACE,
  assertDeploymentObservabilityPass,
  buildDeploymentObservabilityReport,
  buildDeploymentLogManifest,
  buildObservabilitySurfaceManifest,
  buildOpsEventManifest,
  buildSampleDeploymentLogs,
  formatDeploymentObservabilitySummary,
  formatStructuredDeploymentLog,
  isStructuredDeploymentLogShape,
  runDeploymentObservability,
  serializeStructuredDeploymentLog,
} from "../lib/deployment/v66";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v66-p3-deployment-observability";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/deployment/v66/observability.ts",
    "lib/deployment/v66/observability.types.ts",
    "lib/deployment/v66/observability.artifacts.ts",
    "lib/deployment/v66/observability.builder.ts",
    "lib/deployment/v66/observability.entry.ts",
    "lib/deployment/v66/observability.surface.ts",
    "lib/deployment/v66/deployment.log.inventory.ts",
    "lib/deployment/v66/deployment.log.formatter.ts",
    "lib/deployment/v66/ops.event.catalog.ts",
    "docs/deployment/V66-DEPLOYMENT-OBSERVABILITY.md",
    "lib/portal/v60/observability/platform-events.ts",
  ];
  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V66 deployment observability module structure");
}

function testInventories() {
  assert(DEPLOYMENT_LOG_EVENT_INVENTORY.length >= 8, "deployment log inventory");
  assert(OPS_EVENT_CATALOG.length >= 10, "ops event catalog");
  assert(OBSERVABILITY_SURFACE.length >= 8, "observability surface");
  assert(DEPLOYMENT_LOG_SCHEMA_FIELDS.length >= 7, "log schema fields");
  console.log("✓ log, ops event & observability inventories");
}

function testStructuredLogs() {
  const logManifest = buildDeploymentLogManifest();
  assert(logManifest.schemaComplete, "log schema complete");

  const entry = formatStructuredDeploymentLog({
    deploymentId: DEPLOYMENT_ID,
    eventId: "DEP-LOG-001",
    timestamp: "1970-01-01T00:00:00.000Z",
    meta: { verify: true },
  });
  assert(entry !== null, "format structured log");
  assert(entry!.schemaVersion === V66_DEPLOYMENT_OBSERVABILITY_VERSION, "log schema version");
  assert(isStructuredDeploymentLogShape(entry as unknown as Record<string, unknown>), "log shape");

  const serialized = serializeStructuredDeploymentLog(entry!);
  const parsed = JSON.parse(serialized);
  assert(parsed.message === "deployment_baseline_verified", "serialized log message");

  const samples = buildSampleDeploymentLogs(DEPLOYMENT_ID);
  assert(samples.length >= 4, "sample logs");
  console.log("✓ structured deployment logs");
}

function testManifests() {
  const opsEvents = buildOpsEventManifest();
  assert(opsEvents.catalogComplete, "ops event catalog complete");

  const surface = buildObservabilitySurfaceManifest();
  assert(surface.surfaceComplete, "observability surface complete");
  console.log("✓ ops event & observability manifests");
}

function testReport() {
  const incomplete = runDeploymentObservability({
    deploymentId: DEPLOYMENT_ID,
    signals: { logSchemaComplete: false },
  });
  assert(!incomplete.observabilityReady, "incomplete signals not ready");

  const ready = buildDeploymentObservabilityReport({ deploymentId: DEPLOYMENT_ID });

  assert(ready.version === V66_DEPLOYMENT_OBSERVABILITY_VERSION, "observability version");
  assert(ready.executionReady, "execution ready");
  assert(ready.deploymentLogs.schemaComplete, "deployment logs complete");
  assert(ready.opsEvents.catalogComplete, "ops events complete");
  assert(ready.observabilitySurface.surfaceComplete, "surface complete");
  assert(ready.observabilityReady, "observability ready");
  assert(ready.readinessScore === 100, "readiness score 100");
  assertDeploymentObservabilityPass(ready);

  assert(
    V66_OBSERVABILITY_ARTIFACT_SURFACE.verifyObservability.includes("verify:v66-p3"),
    "artifact surface verify script",
  );

  console.log("✓ deployment observability report");
  console.log(formatDeploymentObservabilitySummary(ready));
  console.log("\n✅ V66 P3 Deployment Observability Baseline — verify PASS");
}

function main() {
  console.log("V66 P3 Deployment Observability Baseline Verification\n");
  checkModuleStructure();
  testInventories();
  testStructuredLogs();
  testManifests();
  testReport();
}

main();
