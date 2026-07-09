/**
 * V68 P6 — Reliability Policy Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  DEGRADATION_STRATEGY_CATALOG,
  FAILURE_SEVERITY_CATALOG,
  RECOVERY_STRATEGY_CATALOG,
  RELIABILITY_OBJECTIVE_CATALOG,
  V68_RELIABILITY_POLICY_ARTIFACT_SURFACE,
  V68_RELIABILITY_POLICY_VERSION,
  V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P6,
  assertReliabilityPolicyPass,
  buildDegradationStrategyManifest,
  buildFailureSeverityManifest,
  buildRecoveryStrategyManifest,
  buildReliabilityObjectiveManifest,
  buildReliabilityPolicyReport,
  computeDeclarativeRtoBudget,
  formatReliabilityPolicySummary,
  getDegradationByServiceRef,
  getFailureSeverityById,
  getFailureSeveritiesByTier,
  getObjectivesByServiceRef,
  getRecoveryByServiceRef,
  isReliabilityPolicyRefsAligned,
  isUpstreamPlatformGovernanceLockP6Intact,
  runReliabilityPolicy,
} from "../lib/platform/v68";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v68-p6-reliability-policy";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/platform/v68/reliability-policy/reliability-policy.ts",
    "lib/platform/v68/reliability-policy/governance.types.ts",
    "lib/platform/v68/reliability-policy/governance.constants.ts",
    "lib/platform/v68/reliability-policy/governance.surface.ts",
    "lib/platform/v68/reliability-policy/governance.builder.ts",
    "lib/platform/v68/reliability-policy/governance.entry.ts",
    "lib/platform/v68/reliability-policy/reliability.objective.catalog.ts",
    "lib/platform/v68/reliability-policy/failure.severity.catalog.ts",
    "lib/platform/v68/reliability-policy/degradation.strategy.catalog.ts",
    "lib/platform/v68/reliability-policy/recovery.strategy.catalog.ts",
    "lib/platform/v68/reliability-policy/alignment.catalog.ts",
    "docs/platform/V68-RELIABILITY-POLICY.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V68 reliability policy module structure");
}

function testInventories() {
  check(RELIABILITY_OBJECTIVE_CATALOG.length >= 6, "reliability objective catalog");
  check(FAILURE_SEVERITY_CATALOG.length >= 6, "failure severity catalog");
  check(DEGRADATION_STRATEGY_CATALOG.length >= 6, "degradation strategy catalog");
  check(RECOVERY_STRATEGY_CATALOG.length >= 6, "recovery strategy catalog");
  check(isUpstreamPlatformGovernanceLockP6Intact(), "upstream platform lock P6 intact");
  console.log("✓ objectives, severities, degradation, recovery & upstream lock");
}

function testCrossReferences() {
  check(isReliabilityPolicyRefsAligned(), "reliability policy refs aligned");

  const apiObjectives = getObjectivesByServiceRef("SVC-DEF-001");
  check(apiObjectives.length >= 2, "SVC-DEF-001 objectives");

  const sev0 = getFailureSeveritiesByTier("sev-0");
  check(sev0.length >= 2, "sev-0 failure severities");

  const fail001 = getFailureSeverityById("REL-FAIL-001");
  check(fail001?.alertSeverityRef === "P0", "REL-FAIL-001 maps to P0");

  const apiDegradation = getDegradationByServiceRef("SVC-DEF-001");
  check(apiDegradation.length >= 2, "SVC-DEF-001 degradation strategies");

  const apiRecovery = getRecoveryByServiceRef("SVC-DEF-001");
  check(apiRecovery.length >= 2, "SVC-DEF-001 recovery strategies");

  const rtoOk = computeDeclarativeRtoBudget({ failureTier: "sev-0", rtoMinutes: 30 });
  check(rtoOk, "declarative RTO budget sev-0");

  check(
    V68_UPSTREAM_PLATFORM_GOVERNANCE_LOCK_P6.capacityPlanning.length > 0,
    "P5 capacity version in lock",
  );
  console.log("✓ cross-references, RTO budget & P1–P5 upstream");
}

function testManifests() {
  check(buildReliabilityObjectiveManifest().catalogComplete, "objectives manifest complete");
  check(buildFailureSeverityManifest().catalogComplete, "severity manifest complete");
  check(buildDegradationStrategyManifest().catalogComplete, "degradation manifest complete");
  check(buildRecoveryStrategyManifest().catalogComplete, "recovery manifest complete");
  console.log("✓ reliability policy manifests");
}

function testReport() {
  const incomplete = runReliabilityPolicy({
    deploymentId: DEPLOYMENT_ID,
    signals: { capacityPlanningReady: false },
  });
  check(!incomplete.policyReady, "incomplete capacity planning not ready");

  const ready = buildReliabilityPolicyReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V68_RELIABILITY_POLICY_VERSION, "policy version");
  check(ready.capacityPlanningReady, "capacity planning ready");
  check(ready.objectives.catalogComplete, "objectives complete");
  check(ready.failureSeverities.catalogComplete, "severities complete");
  check(ready.degradationStrategies.catalogComplete, "degradation complete");
  check(ready.recoveryStrategies.catalogComplete, "recovery complete");
  check(ready.policyReady, "policy ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertReliabilityPolicyPass(ready);

  check(
    V68_RELIABILITY_POLICY_ARTIFACT_SURFACE.verifyPolicy.includes("verify:v68-p6"),
    "artifact surface verify script",
  );

  console.log("✓ reliability policy report");
  console.log(formatReliabilityPolicySummary(ready));
  console.log("\n✅ V68 P6 Reliability Policy — verify PASS");
}

function main() {
  console.log("V68 P6 Reliability Policy Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
