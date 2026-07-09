/**
 * V72 P1 — Intelligence Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertIntelligenceCatalogPass,
  buildIntelligenceCatalog,
  formatIntelligenceCatalogSummary,
  getIntelligenceById,
  getIntelligenceBySeverity,
  getIntelligenceBySource,
  getIntelligenceWithAnomalies,
  INTELLIGENCE_CATALOG,
  runIntelligenceCatalog,
  V72_INTELLIGENCE_FREEZE_VERSION,
  V72_INTELLIGENCE_VERSION,
} from "../lib/intelligence/v72/intelligence.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v72-p1-intelligence-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/intelligence/v72/intelligence.types.ts",
    "lib/intelligence/v72/intelligence.catalog.ts",
    "lib/intelligence/v72/intelligence.builder.ts",
    "lib/intelligence/v72/intelligence.entry.ts",
    "docs/V72-P1-INTELLIGENCE-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V72 intelligence catalog module structure");
}

function testCatalogFields() {
  check(INTELLIGENCE_CATALOG.length >= 6, "intelligence catalog entries");
  for (const entry of INTELLIGENCE_CATALOG) {
    check(entry.insight.length > 0, `${entry.id} insight`);
    check(entry.signal.length > 0, `${entry.id} signal`);
    check(entry.metric.length > 0, `${entry.id} metric`);
    check(entry.event.length > 0, `${entry.id} event`);
    check(typeof entry.anomaly === "boolean", `${entry.id} anomaly`);
    check(entry.trend.length > 0, `${entry.id} trend`);
    check(entry.owner.length > 0, `${entry.id} owner`);
    check(entry.status.length > 0, `${entry.id} status`);
    check(entry.source.length > 0, `${entry.id} source`);
    check(entry.severity.length > 0, `${entry.id} severity`);
    check(entry.confidence.length > 0, `${entry.id} confidence`);
  }
  console.log("✓ intelligence catalog field coverage");
}

function testCatalogQueries() {
  const insight = getIntelligenceById("INT-001");
  check(insight?.source === "v71-workflow-freeze-1", "INT-001 upstream workflow freeze");
  check(insight?.confidence === "high", "INT-001 confidence high");

  const v71 = getIntelligenceBySource("v71-workflow-policy-1");
  check(v71.length >= 1, "v71-workflow-policy-1 source insights");

  const high = getIntelligenceBySeverity("high");
  check(high.length >= 1, "high severity insights");

  const anomalies = getIntelligenceWithAnomalies();
  check(anomalies.length >= 1, "anomaly insights");

  console.log("✓ intelligence catalog queries");
}

function testReport() {
  const incomplete = runIntelligenceCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { catalogComplete: false },
  });
  check(!incomplete.catalogReady, "incomplete catalog not ready");

  const ready = buildIntelligenceCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V72_INTELLIGENCE_VERSION, "intelligence version");
  check(ready.freezeVersion === V72_INTELLIGENCE_FREEZE_VERSION, "freeze version declared");
  check(ready.manifest.catalogComplete, "manifest complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertIntelligenceCatalogPass(ready);

  console.log("✓ intelligence catalog report");
  console.log(formatIntelligenceCatalogSummary(ready));
  console.log("\n✅ V72 P1 Intelligence Catalog — verify PASS");
}

function main() {
  console.log("V72 P1 Intelligence Catalog Verification\n");
  checkModuleStructure();
  testCatalogFields();
  testCatalogQueries();
  testReport();
}

main();
