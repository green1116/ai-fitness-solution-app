/**
 * V68 P4 — Feature Flag Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  FLAG_DEFINITION_CATALOG,
  FLAG_SCOPE_CATALOG,
  FLAG_STATE_CATALOG,
  TOGGLE_RULE_CATALOG,
  V68_FEATURE_FLAG_GOVERNANCE_ARTIFACT_SURFACE,
  V68_FEATURE_FLAG_GOVERNANCE_VERSION,
  V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P4,
  assertFeatureFlagGovernancePass,
  buildFeatureFlagGovernanceReport,
  buildFlagDefinitionManifest,
  buildFlagScopeManifest,
  buildFlagStateManifest,
  buildToggleContractManifest,
  formatFeatureFlagGovernanceSummary,
  getFlagDefinitionByKey,
  getFlagScopesByFlagRef,
  getFlagStateByFlagRef,
  getToggleRulesByFlagRef,
  isFeatureFlagRefsAligned,
  isUpstreamPlatformGovernanceLockP4Intact,
  runFeatureFlagGovernance,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p4-feature-flag-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/feature-flag/feature-flag.ts",
    "lib/platform/v68/feature-flag/governance.types.ts",
    "lib/platform/v68/feature-flag/governance.constants.ts",
    "lib/platform/v68/feature-flag/governance.surface.ts",
    "lib/platform/v68/feature-flag/governance.builder.ts",
    "lib/platform/v68/feature-flag/governance.entry.ts",
    "lib/platform/v68/feature-flag/flag.definition.catalog.ts",
    "lib/platform/v68/feature-flag/flag.state.catalog.ts",
    "lib/platform/v68/feature-flag/flag.scope.catalog.ts",
    "lib/platform/v68/feature-flag/flag.toggle.contract.ts",
    "lib/platform/v68/feature-flag/alignment.catalog.ts",
    "docs/platform/V68-FEATURE-FLAG-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 feature flag governance module structure");
}

function testInventories() {
  check(FLAG_DEFINITION_CATALOG.length >= 6, "flag definition catalog");
  check(FLAG_STATE_CATALOG.length >= 6, "flag state catalog");
  check(FLAG_SCOPE_CATALOG.length >= 6, "flag scope catalog");
  check(TOGGLE_RULE_CATALOG.length >= 6, "toggle rule catalog");
  check(isUpstreamPlatformGovernanceLockP4Intact(), "upstream platform lock P4 intact");
  console.log("✓ flag definitions, states, scopes, toggles & upstream lock");
}

function testCrossReferences() {
  check(isFeatureFlagRefsAligned(), "feature flag refs aligned");

  const apiFlag = getFlagDefinitionByKey("production_api_enabled");
  check(apiFlag?.serviceDefRef === "SVC-DEF-001", "production_api_enabled service ref");

  const apiState = getFlagStateByFlagRef("FF-DEF-001");
  check(apiState?.stateKind === "enabled", "FF-DEF-001 state");

  const apiScopes = getFlagScopesByFlagRef("FF-DEF-001");
  check(apiScopes.length >= 1, "FF-DEF-001 scopes");

  const apiToggles = getToggleRulesByFlagRef("FF-DEF-001");
  check(apiToggles.length >= 1, "FF-DEF-001 toggle rules");

  check(
    V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P4.configurationGovernance.length > 0,
    "P3 config version in lock",
  );
  console.log("✓ cross-references & P1–P3 upstream alignment");
}

function testManifests() {
  check(buildFlagDefinitionManifest().catalogComplete, "definition manifest complete");
  check(buildFlagStateManifest().catalogComplete, "state manifest complete");
  check(buildFlagScopeManifest().catalogComplete, "scope manifest complete");
  check(buildToggleContractManifest().contractComplete, "toggle contract complete");
  console.log("✓ feature flag manifests");
}

function testReport() {
  const incomplete = runFeatureFlagGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { configurationGovernanceReady: false },
  });
  check(!incomplete.governanceReady, "incomplete config governance not ready");

  const ready = buildFeatureFlagGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_FEATURE_FLAG_GOVERNANCE_VERSION, "governance version");
  check(ready.configurationGovernanceReady, "configuration governance ready");
  check(ready.flagDefinitions.catalogComplete, "definitions complete");
  check(ready.flagStates.catalogComplete, "states complete");
  check(ready.flagScopes.catalogComplete, "scopes complete");
  check(ready.toggleContract.contractComplete, "toggle contract complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertFeatureFlagGovernancePass(ready);

  check(
    V68_FEATURE_FLAG_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v68-p4"),
    "artifact surface verify script",
  );

  console.log("✓ feature flag governance report");
  console.log(formatFeatureFlagGovernanceSummary(ready));
  console.log("\n✅ V68 P4 Feature Flag Governance — verify PASS");
}

function main() {
  console.log("V68 P4 Feature Flag Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
