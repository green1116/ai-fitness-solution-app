/**
 * V68 P3 — Configuration Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CONFIG_ALIGNMENT_CATALOG,
  CONFIG_ITEM_CATALOG,
  CONFIG_SOURCE_CATALOG,
  CONFIG_VALIDITY_CATALOG,
  V68_CONFIGURATION_GOVERNANCE_ARTIFACT_SURFACE,
  V68_CONFIGURATION_GOVERNANCE_VERSION,
  V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK,
  assertConfigurationGovernancePass,
  buildConfigAlignmentManifest,
  buildConfigItemManifest,
  buildConfigSourceManifest,
  buildConfigValidityManifest,
  buildConfigurationGovernanceReport,
  computeDeclarativeAlignmentScore,
  formatConfigurationGovernanceSummary,
  getConfigItemById,
  getConfigItemsByService,
  getConfigSourceById,
  getValidityRulesByItemRef,
  isConfigurationRefsAligned,
  isUpstreamPlatformGovernanceLockIntact,
  runConfigurationGovernance,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p3-configuration-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/configuration/configuration.ts",
    "lib/platform/v68/configuration/governance.types.ts",
    "lib/platform/v68/configuration/governance.constants.ts",
    "lib/platform/v68/configuration/governance.surface.ts",
    "lib/platform/v68/configuration/governance.builder.ts",
    "lib/platform/v68/configuration/governance.entry.ts",
    "lib/platform/v68/configuration/config.item.catalog.ts",
    "lib/platform/v68/configuration/config.source.catalog.ts",
    "lib/platform/v68/configuration/config.validity.contract.ts",
    "lib/platform/v68/configuration/alignment.catalog.ts",
    "docs/platform/V68-CONFIGURATION-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 configuration governance module structure");
}

function testInventories() {
  check(CONFIG_ITEM_CATALOG.length >= 6, "config item catalog");
  check(CONFIG_SOURCE_CATALOG.length >= 6, "config source catalog");
  check(CONFIG_VALIDITY_CATALOG.length >= 6, "config validity catalog");
  check(CONFIG_ALIGNMENT_CATALOG.length >= 6, "config alignment catalog");
  check(isUpstreamPlatformGovernanceLockIntact(), "upstream platform lock intact");
  console.log("✓ config items, sources, validity, alignment & upstream lock");
}

function testCrossReferences() {
  check(isConfigurationRefsAligned(), "configuration refs aligned");

  const item001 = getConfigItemById("CFG-ITEM-001");
  check(item001?.serviceDefRef === "SVC-DEF-001", "CFG-ITEM-001 service ref");

  const apiItems = getConfigItemsByService("SVC-DEF-001");
  check(apiItems.length >= 1, "SVC-DEF-001 config items");

  const src001 = getConfigSourceById("CFG-SRC-001");
  check(src001?.sourceKind === "environment", "CFG-SRC-001 environment source");

  const val001 = getValidityRulesByItemRef("CFG-ITEM-001");
  check(val001.length >= 1, "CFG-ITEM-001 validity rules");

  const score = computeDeclarativeAlignmentScore();
  check(score === 100, "declarative alignment score 100");

  check(
    V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK.dependencyGraph.length > 0,
    "P2 graph version in lock",
  );
  console.log("✓ cross-references, alignment & P1–P2 upstream");
}

function testManifests() {
  check(buildConfigItemManifest().catalogComplete, "item manifest complete");
  check(buildConfigSourceManifest().catalogComplete, "source manifest complete");
  check(buildConfigValidityManifest().contractComplete, "validity manifest complete");
  check(buildConfigAlignmentManifest().manifestComplete, "alignment manifest complete");
  console.log("✓ configuration governance manifests");
}

function testReport() {
  const incomplete = runConfigurationGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { dependencyGraphReady: false },
  });
  check(!incomplete.governanceReady, "incomplete graph not ready");

  const ready = buildConfigurationGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_CONFIGURATION_GOVERNANCE_VERSION, "governance version");
  check(ready.dependencyGraphReady, "dependency graph ready");
  check(ready.configItems.catalogComplete, "items complete");
  check(ready.configSources.catalogComplete, "sources complete");
  check(ready.configValidity.contractComplete, "validity complete");
  check(ready.configAlignment.manifestComplete, "alignment complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertConfigurationGovernancePass(ready);

  check(
    V68_CONFIGURATION_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v68-p3"),
    "artifact surface verify script",
  );

  console.log("✓ configuration governance report");
  console.log(formatConfigurationGovernanceSummary(ready));
  console.log("\n✅ V68 P3 Configuration Governance — verify PASS");
}

function main() {
  console.log("V68 P3 Configuration Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
