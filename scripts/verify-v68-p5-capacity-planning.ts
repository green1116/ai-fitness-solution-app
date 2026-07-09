/**
 * V68 P5 — Capacity Planning Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CAPACITY_BASELINE_CATALOG,
  RESOURCE_LIMIT_CATALOG,
  STRESS_RISK_CATALOG,
  THRESHOLD_DEFINITION_CATALOG,
  V68_CAPACITY_PLANNING_ARTIFACT_SURFACE,
  V68_CAPACITY_PLANNING_VERSION,
  V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P5,
  assertCapacityPlanningPass,
  buildCapacityBaselineManifest,
  buildCapacityPlanningReport,
  buildResourceLimitManifest,
  buildStressRiskManifest,
  buildThresholdDefinitionManifest,
  computeDeclarativeCapacityHeadroom,
  formatCapacityPlanningSummary,
  getBaselineByServiceRef,
  getResourceLimitByServiceRef,
  getStressRisksByServiceRef,
  getThresholdsByBaselineRef,
  isCapacityPlanningRefsAligned,
  isUpstreamPlatformGovernanceLockP5Intact,
  runCapacityPlanning,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p5-capacity-planning";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/capacity-planning/capacity-planning.ts",
    "lib/platform/v68/capacity-planning/governance.types.ts",
    "lib/platform/v68/capacity-planning/governance.constants.ts",
    "lib/platform/v68/capacity-planning/governance.surface.ts",
    "lib/platform/v68/capacity-planning/governance.builder.ts",
    "lib/platform/v68/capacity-planning/governance.entry.ts",
    "lib/platform/v68/capacity-planning/capacity.baseline.catalog.ts",
    "lib/platform/v68/capacity-planning/threshold.definition.catalog.ts",
    "lib/platform/v68/capacity-planning/resource.limit.catalog.ts",
    "lib/platform/v68/capacity-planning/stress.risk.catalog.ts",
    "lib/platform/v68/capacity-planning/alignment.catalog.ts",
    "docs/platform/V68-CAPACITY-PLANNING.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 capacity planning module structure");
}

function testInventories() {
  check(CAPACITY_BASELINE_CATALOG.length >= 6, "capacity baseline catalog");
  check(THRESHOLD_DEFINITION_CATALOG.length >= 6, "threshold definition catalog");
  check(RESOURCE_LIMIT_CATALOG.length >= 6, "resource limit catalog");
  check(STRESS_RISK_CATALOG.length >= 6, "stress risk catalog");
  check(isUpstreamPlatformGovernanceLockP5Intact(), "upstream platform lock P5 intact");
  console.log("✓ baselines, thresholds, limits, risks & upstream lock");
}

function testCrossReferences() {
  check(isCapacityPlanningRefsAligned(), "capacity planning refs aligned");

  const apiBaselines = getBaselineByServiceRef("SVC-DEF-001");
  check(apiBaselines.length >= 1, "SVC-DEF-001 baselines");

  const apiThresholds = getThresholdsByBaselineRef("CAP-BASE-001");
  check(apiThresholds.length >= 2, "CAP-BASE-001 thresholds");

  const apiLimits = getResourceLimitByServiceRef("SVC-DEF-001");
  check(apiLimits.length >= 1, "SVC-DEF-001 resource limits");

  const apiRisks = getStressRisksByServiceRef("SVC-DEF-001");
  check(apiRisks.length >= 1, "SVC-DEF-001 stress risks");

  const headroom = computeDeclarativeCapacityHeadroom({
    baselineValue: 1000,
    currentValue: 1500,
    maxValue: 3000,
  });
  check(headroom > 0 && headroom < 100, "declarative capacity headroom");

  check(
    V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P5.featureFlagGovernance.length > 0,
    "P4 feature flag version in lock",
  );
  console.log("✓ cross-references, headroom & P1–P4 upstream");
}

function testManifests() {
  check(buildCapacityBaselineManifest().catalogComplete, "baseline manifest complete");
  check(buildThresholdDefinitionManifest().catalogComplete, "threshold manifest complete");
  check(buildResourceLimitManifest().catalogComplete, "resource limit manifest complete");
  check(buildStressRiskManifest().catalogComplete, "stress risk manifest complete");
  console.log("✓ capacity planning manifests");
}

function testReport() {
  const incomplete = runCapacityPlanning({
    deploymentId: DEPLOYMENT_ID,
    signals: { featureFlagGovernanceReady: false },
  });
  check(!incomplete.planningReady, "incomplete feature flags not ready");

  const ready = buildCapacityPlanningReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_CAPACITY_PLANNING_VERSION, "planning version");
  check(ready.featureFlagGovernanceReady, "feature flag governance ready");
  check(ready.baselines.catalogComplete, "baselines complete");
  check(ready.thresholds.catalogComplete, "thresholds complete");
  check(ready.resourceLimits.catalogComplete, "resource limits complete");
  check(ready.stressRisks.catalogComplete, "stress risks complete");
  check(ready.planningReady, "planning ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCapacityPlanningPass(ready);

  check(
    V68_CAPACITY_PLANNING_ARTIFACT_SURFACE.verifyPlanning.includes("verify:v68-p5"),
    "artifact surface verify script",
  );

  console.log("✓ capacity planning report");
  console.log(formatCapacityPlanningSummary(ready));
  console.log("\n✅ V68 P5 Capacity Planning — verify PASS");
}

function main() {
  console.log("V68 P5 Capacity Planning Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
