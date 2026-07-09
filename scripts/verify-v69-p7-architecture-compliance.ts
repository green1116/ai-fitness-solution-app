/**
 * V69 P7 — Architecture Compliance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ALIGNMENT_CHECK_CATALOG,
  ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX,
  ARCHITECTURE_COMPLIANCE_ROLLBACK_INDEX,
  COMPLIANCE_CHECK_CATALOG,
  COMPLIANCE_GATE_CATALOG,
  COMPLIANCE_OBJECT_CATALOG,
  COMPLIANCE_RULE_CATALOG,
  DEVIATION_CATALOG,
  EXCEPTION_CATALOG,
  V69_ARCHITECTURE_COMPLIANCE_ARTIFACT_SURFACE,
  V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK,
  V69_ARCHITECTURE_COMPLIANCE_VERSION,
  V69_UPSTREAM_QUALITY_GOVERNANCE_LOCK,
  assertArchitectureCompliancePass,
  buildAlignmentCheckManifest,
  buildArchitectureComplianceRegistry,
  buildArchitectureComplianceReport,
  buildArchitectureComplianceRollbackIndex,
  buildComplianceCheckManifest,
  buildComplianceGateManifest,
  buildComplianceObjectManifest,
  buildComplianceRuleManifest,
  buildDeviationManifest,
  buildExceptionManifest,
  computeDeclarativeComplianceBlock,
  computeDeclarativeExceptionActive,
  formatArchitectureComplianceSummary,
  getAlignmentChecksByLayer,
  getComplianceChecksByRuleRef,
  getComplianceGateByPhaseRef,
  getComplianceObjectById,
  getComplianceRuleById,
  getComplianceRulesByObjectRef,
  getDeviationsByObjectRef,
  getExceptionByDeviationRef,
  getExceptionsByStatus,
  isArchitectureComplianceFreezeLockIntact,
  isArchitectureComplianceRefsAligned,
  isArchitectureComplianceRegistryIdKnown,
  isUpstreamQualityGovernanceLockIntact,
  architectureComplianceFreezeLockMatchesExpected,
  runArchitectureCompliance,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p7-architecture-compliance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/architecture-compliance/architecture-compliance.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.types.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.constants.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.surface.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.builder.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.entry.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.registry.ts",
    "lib/technical-governance/v69/architecture-compliance/freeze.lock.ts",
    "lib/technical-governance/v69/architecture-compliance/rollback.index.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.object.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.rule.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.check.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/compliance.gate.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/alignment.check.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/deviation.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/exception.catalog.ts",
    "lib/technical-governance/v69/architecture-compliance/alignment.catalog.ts",
    "docs/technical-governance/V69-ARCHITECTURE-COMPLIANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 architecture compliance module structure");
}

function testInventories() {
  check(COMPLIANCE_OBJECT_CATALOG.length >= 6, "compliance object catalog");
  check(COMPLIANCE_RULE_CATALOG.length >= 6, "compliance rule catalog");
  check(COMPLIANCE_CHECK_CATALOG.length >= 6, "compliance check catalog");
  check(COMPLIANCE_GATE_CATALOG.length >= 6, "compliance gate catalog");
  check(ALIGNMENT_CHECK_CATALOG.length >= 6, "alignment check catalog");
  check(DEVIATION_CATALOG.length >= 6, "deviation catalog");
  check(EXCEPTION_CATALOG.length >= 6, "exception catalog");
  check(isUpstreamQualityGovernanceLockIntact(), "upstream quality governance lock intact");
  check(isArchitectureComplianceFreezeLockIntact(), "freeze lock intact");
  check(architectureComplianceFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ objects, rules, checks, gates, alignment, deviations, exceptions & locks");
}

function testCrossReferences() {
  check(isArchitectureComplianceRefsAligned(), "architecture compliance refs aligned");

  const cObj = getComplianceObjectById("ACMP-OBJ-001");
  check(cObj?.arcDefRef === "ARC-DEF-001", "ACMP-OBJ-001 arc def ref");
  check(cObj?.qualityObjectRef === "QGOV-OBJ-001", "ACMP-OBJ-001 quality object ref");
  check(cObj?.standardPolicyRef === "TSTD-SET-001", "ACMP-OBJ-001 policy set ref");

  const rules = getComplianceRulesByObjectRef("ACMP-OBJ-005");
  check(rules.length >= 1, "ACMP-OBJ-005 compliance rules");

  const rule = getComplianceRuleById("ACMP-RUL-005");
  check(rule?.kind === "gate", "ACMP-RUL-005 gate rule");

  const checks = getComplianceChecksByRuleRef("ACMP-RUL-005");
  check(checks.length >= 1, "ACMP-RUL-005 compliance checks");

  const deviations = getDeviationsByObjectRef("ACMP-OBJ-005");
  check(deviations.length >= 1, "ACMP-OBJ-005 deviations");
  check(deviations[0]?.gateBlock === true, "ACMP-OBJ-005 gate block");

  const exc = getExceptionByDeviationRef("ACMP-DEV-005");
  check(exc?.status === "rejected", "ACMP-DEV-005 exception rejected");

  const p7Gates = getComplianceGateByPhaseRef("P7");
  check(p7Gates.length >= 2, "P7 compliance gates");

  const aln = getAlignmentChecksByLayer("P7-compliance");
  check(aln.length >= 2, "P7-compliance alignment checks");

  const approved = getExceptionsByStatus("approved");
  check(approved.length >= 1, "approved exceptions catalog");

  check(
    computeDeclarativeComplianceBlock({ severity: "blocker" }),
    "declarative compliance block blocker",
  );
  check(
    !computeDeclarativeComplianceBlock({ severity: "minor" }),
    "declarative compliance block minor",
  );
  check(
    computeDeclarativeExceptionActive({ status: "approved" }),
    "declarative exception active approved",
  );
  check(
    !computeDeclarativeExceptionActive({ status: "rejected" }),
    "declarative exception inactive rejected",
  );

  check(
    V69_UPSTREAM_QUALITY_GOVERNANCE_LOCK.qualityGovernance.length > 0,
    "P6 quality version in lock",
  );
  check(
    V69_ARCHITECTURE_COMPLIANCE_FREEZE_LOCK.architectureCompliance ===
      V69_ARCHITECTURE_COMPLIANCE_VERSION,
    "freeze lock compliance version",
  );
  console.log("✓ cross-references & P1–P6 upstream");
}

function testRegistryAndRollback() {
  const registry = buildArchitectureComplianceRegistry();
  check(registry.registryComplete, "architecture compliance registry complete");
  check(registry.totalEntries >= 56, "registry total entries");
  check(
    isArchitectureComplianceRegistryIdKnown("rules", "ACMP-RUL-001"),
    "registry knows ACMP-RUL-001",
  );
  check(
    ARCHITECTURE_COMPLIANCE_REGISTRY_INDEX.objects.length === COMPLIANCE_OBJECT_CATALOG.length,
    "registry object index synced",
  );

  const rollback = buildArchitectureComplianceRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(ARCHITECTURE_COMPLIANCE_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ architecture compliance registry & rollback index");
}

function testManifests() {
  check(buildComplianceObjectManifest().catalogComplete, "object manifest complete");
  check(buildComplianceRuleManifest().catalogComplete, "rule manifest complete");
  check(buildComplianceCheckManifest().catalogComplete, "check manifest complete");
  check(buildComplianceGateManifest().catalogComplete, "gate manifest complete");
  check(buildAlignmentCheckManifest().catalogComplete, "alignment manifest complete");
  check(buildDeviationManifest().catalogComplete, "deviation manifest complete");
  check(buildExceptionManifest().catalogComplete, "exception manifest complete");
  console.log("✓ architecture compliance manifests");
}

function testReport() {
  const incomplete = runArchitectureCompliance({
    deploymentId: DEPLOYMENT_ID,
    signals: { qualityGovernanceReady: false },
  });
  check(!incomplete.complianceReady, "incomplete quality not ready");

  const ready = buildArchitectureComplianceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_ARCHITECTURE_COMPLIANCE_VERSION, "compliance version");
  check(ready.qualityGovernanceReady, "quality governance ready");
  check(ready.objects.catalogComplete, "objects complete");
  check(ready.rules.catalogComplete, "rules complete");
  check(ready.checks.catalogComplete, "checks complete");
  check(ready.gates.catalogComplete, "gates complete");
  check(ready.alignmentChecks.catalogComplete, "alignment complete");
  check(ready.deviations.catalogComplete, "deviations complete");
  check(ready.exceptions.catalogComplete, "exceptions complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.complianceReady, "compliance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertArchitectureCompliancePass(ready);

  check(
    V69_ARCHITECTURE_COMPLIANCE_ARTIFACT_SURFACE.verifyCompliance.includes("verify:v69-p7"),
    "artifact surface verify script",
  );

  console.log("✓ architecture compliance report");
  console.log(formatArchitectureComplianceSummary(ready));
  console.log("\n✅ V69 P7 Architecture Compliance — verify PASS");
}

function main() {
  console.log("V69 P7 Architecture Compliance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
