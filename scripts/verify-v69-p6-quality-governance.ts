/**
 * V69 P6 — Quality Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ACCEPTANCE_RULE_CATALOG,
  DEFECT_CONTROL_CATALOG,
  QUALITY_GATE_CATALOG,
  QUALITY_GOVERNANCE_OBJECT_CATALOG,
  QUALITY_GOVERNANCE_REGISTRY_INDEX,
  QUALITY_GOVERNANCE_ROLLBACK_INDEX,
  QUALITY_STANDARD_CATALOG,
  RELEASE_QUALITY_CATALOG,
  TEST_STANDARD_CATALOG,
  V69_QUALITY_GOVERNANCE_ARTIFACT_SURFACE,
  V69_QUALITY_GOVERNANCE_FREEZE_LOCK,
  V69_QUALITY_GOVERNANCE_VERSION,
  V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK,
  assertQualityGovernancePass,
  buildAcceptanceRuleManifest,
  buildDefectControlManifest,
  buildQualityGateManifest,
  buildQualityGovernanceObjectManifest,
  buildQualityGovernanceRegistry,
  buildQualityGovernanceReport,
  buildQualityGovernanceRollbackIndex,
  buildQualityStandardManifest,
  buildReleaseQualityManifest,
  buildTestStandardManifest,
  computeDeclarativeGateBlock,
  formatQualityGovernanceSummary,
  getAcceptanceRulesByGateRef,
  getDefectControlsByObjectRef,
  getQualityGateByPhaseRef,
  getQualityObjectById,
  getQualityStandardById,
  getReleaseQualityByGateRef,
  getTestStandardsByObjectRef,
  isQualityGovernanceFreezeLockIntact,
  isQualityGovernanceRefsAligned,
  isQualityGovernanceRegistryIdKnown,
  isUpstreamSecurityGovernanceLockIntact,
  qualityGovernanceFreezeLockMatchesExpected,
  runQualityGovernance,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p6-quality-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/quality-governance/quality-governance.ts",
    "lib/technical-governance/v69/quality-governance/governance.types.ts",
    "lib/technical-governance/v69/quality-governance/governance.constants.ts",
    "lib/technical-governance/v69/quality-governance/governance.surface.ts",
    "lib/technical-governance/v69/quality-governance/governance.builder.ts",
    "lib/technical-governance/v69/quality-governance/governance.entry.ts",
    "lib/technical-governance/v69/quality-governance/governance.registry.ts",
    "lib/technical-governance/v69/quality-governance/freeze.lock.ts",
    "lib/technical-governance/v69/quality-governance/rollback.index.ts",
    "lib/technical-governance/v69/quality-governance/quality.object.catalog.ts",
    "lib/technical-governance/v69/quality-governance/quality.standard.catalog.ts",
    "lib/technical-governance/v69/quality-governance/quality.gate.catalog.ts",
    "lib/technical-governance/v69/quality-governance/test.standard.catalog.ts",
    "lib/technical-governance/v69/quality-governance/acceptance.rule.catalog.ts",
    "lib/technical-governance/v69/quality-governance/defect.control.catalog.ts",
    "lib/technical-governance/v69/quality-governance/release.quality.catalog.ts",
    "lib/technical-governance/v69/quality-governance/alignment.catalog.ts",
    "docs/technical-governance/V69-QUALITY-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 quality governance module structure");
}

function testInventories() {
  check(QUALITY_GOVERNANCE_OBJECT_CATALOG.length >= 6, "quality object catalog");
  check(QUALITY_STANDARD_CATALOG.length >= 6, "quality standard catalog");
  check(QUALITY_GATE_CATALOG.length >= 6, "quality gate catalog");
  check(TEST_STANDARD_CATALOG.length >= 6, "test standard catalog");
  check(ACCEPTANCE_RULE_CATALOG.length >= 6, "acceptance rule catalog");
  check(DEFECT_CONTROL_CATALOG.length >= 6, "defect control catalog");
  check(RELEASE_QUALITY_CATALOG.length >= 6, "release quality catalog");
  check(isUpstreamSecurityGovernanceLockIntact(), "upstream security governance lock intact");
  check(isQualityGovernanceFreezeLockIntact(), "freeze lock intact");
  check(qualityGovernanceFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ objects, standards, gates, tests, acceptance, defects, release & locks");
}

function testCrossReferences() {
  check(isQualityGovernanceRefsAligned(), "quality governance refs aligned");

  const qObj = getQualityObjectById("QGOV-OBJ-001");
  check(qObj?.arcDefRef === "ARC-DEF-001", "QGOV-OBJ-001 arc def ref");
  check(qObj?.securityObjectRef === "SEC-OBJ-002", "QGOV-OBJ-001 security object ref");
  check(qObj?.codeObjectRef === "CGOV-OBJ-001", "QGOV-OBJ-001 code object ref");

  const tests = getTestStandardsByObjectRef("QGOV-OBJ-005");
  check(tests.length >= 1, "QGOV-OBJ-005 test standards");

  const defects = getDefectControlsByObjectRef("QGOV-OBJ-005");
  check(defects.length >= 1, "QGOV-OBJ-005 defect controls");
  check(defects[0]?.gateBlock === true, "QGOV-OBJ-005 gate block");

  const acceptance = getAcceptanceRulesByGateRef("QGOV-GATE-008");
  check(acceptance.length >= 1, "QGOV-GATE-008 acceptance rules");

  const release = getReleaseQualityByGateRef("QGOV-GATE-008");
  check(release?.readinessScore === 100, "QGOV-GATE-008 release readiness");

  const p6Gates = getQualityGateByPhaseRef("P6");
  check(p6Gates.length >= 3, "P6 quality gates");

  const std = getQualityStandardById("QGOV-STD-003");
  check(std?.kind === "acceptance", "QGOV-STD-003 acceptance standard");

  check(
    computeDeclarativeGateBlock({ severity: "blocker" }),
    "declarative gate block blocker",
  );
  check(
    !computeDeclarativeGateBlock({ severity: "minor" }),
    "declarative gate block minor",
  );

  check(
    V69_UPSTREAM_SECURITY_GOVERNANCE_LOCK.securityGovernance.length > 0,
    "P5 security version in lock",
  );
  check(
    V69_QUALITY_GOVERNANCE_FREEZE_LOCK.qualityGovernance === V69_QUALITY_GOVERNANCE_VERSION,
    "freeze lock governance version",
  );
  console.log("✓ cross-references & P1–P5 upstream");
}

function testRegistryAndRollback() {
  const registry = buildQualityGovernanceRegistry();
  check(registry.registryComplete, "quality governance registry complete");
  check(registry.totalEntries >= 56, "registry total entries");
  check(isQualityGovernanceRegistryIdKnown("gates", "QGOV-GATE-001"), "registry knows QGOV-GATE-001");
  check(
    QUALITY_GOVERNANCE_REGISTRY_INDEX.objects.length === QUALITY_GOVERNANCE_OBJECT_CATALOG.length,
    "registry object index synced",
  );

  const rollback = buildQualityGovernanceRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(QUALITY_GOVERNANCE_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ quality governance registry & rollback index");
}

function testManifests() {
  check(buildQualityGovernanceObjectManifest().catalogComplete, "object manifest complete");
  check(buildQualityStandardManifest().catalogComplete, "standard manifest complete");
  check(buildQualityGateManifest().catalogComplete, "gate manifest complete");
  check(buildTestStandardManifest().catalogComplete, "test manifest complete");
  check(buildAcceptanceRuleManifest().catalogComplete, "acceptance manifest complete");
  check(buildDefectControlManifest().catalogComplete, "defect manifest complete");
  check(buildReleaseQualityManifest().catalogComplete, "release manifest complete");
  console.log("✓ quality governance manifests");
}

function testReport() {
  const incomplete = runQualityGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { securityGovernanceReady: false },
  });
  check(!incomplete.governanceReady, "incomplete security not ready");

  const ready = buildQualityGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_QUALITY_GOVERNANCE_VERSION, "governance version");
  check(ready.securityGovernanceReady, "security governance ready");
  check(ready.objects.catalogComplete, "objects complete");
  check(ready.standards.catalogComplete, "standards complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.testStandards.catalogComplete, "tests complete");
  check(ready.acceptanceRules.catalogComplete, "acceptance complete");
  check(ready.defectControls.catalogComplete, "defects complete");
  check(ready.releaseQuality.catalogComplete, "release complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertQualityGovernancePass(ready);

  check(
    V69_QUALITY_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v69-p6"),
    "artifact surface verify script",
  );

  console.log("✓ quality governance report");
  console.log(formatQualityGovernanceSummary(ready));
  console.log("\n✅ V69 P6 Quality Governance — verify PASS");
}

function main() {
  console.log("V69 P6 Quality Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
