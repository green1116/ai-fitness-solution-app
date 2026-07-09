/**
 * V67 P3 — Alert Taxonomy & Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ALERT_GOVERNANCE_RULE_CATALOG,
  ALERT_TYPE_CATALOG,
  SEVERITY_TIER_CATALOG,
  SUPPRESSION_RULE_CATALOG,
  V67_ALERT_TAXONOMY_ARTIFACT_SURFACE,
  V67_ALERT_TAXONOMY_VERSION,
  assertAlertTaxonomyPass,
  buildAlertRuleCatalogManifest,
  buildAlertTaxonomyReport,
  buildAlertTypeManifest,
  buildSeverityTierManifest,
  buildSuppressionContractManifest,
  formatAlertTaxonomySummary,
  getRulesByTypeRef,
  getSuppressionByKind,
  isPageRequiredForTier,
  mapFoundationSeverityToTier,
  runAlertTaxonomy,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p3-alert-taxonomy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/alerting/alerting.ts",
    "lib/monitoring/v67/alerting/taxonomy.types.ts",
    "lib/monitoring/v67/alerting/taxonomy.surface.ts",
    "lib/monitoring/v67/alerting/taxonomy.builder.ts",
    "lib/monitoring/v67/alerting/taxonomy.entry.ts",
    "lib/monitoring/v67/alerting/alert.types.catalog.ts",
    "lib/monitoring/v67/alerting/severity.tiers.ts",
    "lib/monitoring/v67/alerting/rule.catalog.ts",
    "lib/monitoring/v67/alerting/suppression.contract.ts",
    "docs/monitoring/V67-ALERT-TAXONOMY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 alert taxonomy module structure");
}

function testInventories() {
  check(ALERT_TYPE_CATALOG.length >= 10, "alert type catalog");
  check(SEVERITY_TIER_CATALOG.length === 5, "severity tier catalog");
  check(ALERT_GOVERNANCE_RULE_CATALOG.length >= 10, "governance rule catalog");
  check(SUPPRESSION_RULE_CATALOG.length >= 8, "suppression rule catalog");
  console.log("✓ alert type, severity, rule & suppression inventories");
}

function testCrossReferences() {
  check(mapFoundationSeverityToTier("critical") === "P0", "critical maps to P0");
  check(isPageRequiredForTier("P0"), "P0 requires page");
  check(!isPageRequiredForTier("P4"), "P4 no page");

  for (const rule of ALERT_GOVERNANCE_RULE_CATALOG) {
    check(
      ALERT_TYPE_CATALOG.some((t) => t.id === rule.typeRef),
      `typeRef ${rule.typeRef} for ${rule.id}`,
    );
  }

  const dedup = getSuppressionByKind("dedup");
  check(dedup.length >= 2, "dedup suppression rules");

  const sloRules = getRulesByTypeRef("ATY-009");
  check(sloRules.length >= 1, "SLO type has rules");
  console.log("✓ severity mapping & cross-references");
}

function testManifests() {
  check(buildAlertTypeManifest().catalogComplete, "alert types complete");
  check(buildSeverityTierManifest().manifestComplete, "severity tiers complete");
  check(buildAlertRuleCatalogManifest().catalogComplete, "rule catalog complete");
  check(buildSuppressionContractManifest().contractComplete, "suppression complete");
  console.log("✓ taxonomy manifests");
}

function testReport() {
  const incomplete = runAlertTaxonomy({
    deploymentId: DEPLOYMENT_ID,
    signals: { lifecycleReady: false },
  });
  check(!incomplete.taxonomyReady, "incomplete lifecycle not ready");

  const ready = buildAlertTaxonomyReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_ALERT_TAXONOMY_VERSION, "taxonomy version");
  check(ready.lifecycleReady, "lifecycle ready");
  check(ready.alertTypes.catalogComplete, "types complete");
  check(ready.severityTiers.manifestComplete, "tiers complete");
  check(ready.ruleCatalog.catalogComplete, "rules complete");
  check(ready.suppressionContract.contractComplete, "suppression complete");
  check(ready.taxonomyReady, "taxonomy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertAlertTaxonomyPass(ready);

  check(
    V67_ALERT_TAXONOMY_ARTIFACT_SURFACE.verifyTaxonomy.includes("verify:v67-p3"),
    "artifact surface verify script",
  );

  console.log("✓ alert taxonomy report");
  console.log(formatAlertTaxonomySummary(ready));
  console.log("\n✅ V67 P3 Alert Taxonomy & Governance — verify PASS");
}

function main() {
  console.log("V67 P3 Alert Taxonomy & Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
