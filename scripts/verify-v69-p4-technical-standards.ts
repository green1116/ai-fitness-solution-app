/**
 * V69 P4 — Technical Standards Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CHANGE_STANDARD_CATALOG,
  DIRECTORY_STANDARD_CATALOG,
  INTERFACE_STANDARD_CATALOG,
  NAMING_STANDARD_CATALOG,
  STANDARD_POLICY_SET_CATALOG,
  TECHNICAL_STANDARDS_REGISTRY_INDEX,
  TECHNICAL_STANDARDS_ROLLBACK_INDEX,
  VERSION_STANDARD_CATALOG,
  V69_TECHNICAL_STANDARDS_ARTIFACT_SURFACE,
  V69_TECHNICAL_STANDARDS_FREEZE_LOCK,
  V69_TECHNICAL_STANDARDS_VERSION,
  V69_UPSTREAM_CODE_GOVERNANCE_LOCK,
  assertTechnicalStandardsPass,
  buildChangeStandardManifest,
  buildDirectoryStandardManifest,
  buildInterfaceStandardManifest,
  buildNamingStandardManifest,
  buildStandardPolicySetManifest,
  buildTechnicalStandardsRegistry,
  buildTechnicalStandardsReport,
  buildTechnicalStandardsRollbackIndex,
  buildVersionStandardManifest,
  formatTechnicalStandardsSummary,
  getChangeStandardsByKind,
  getDirectoryStandardByBoundaryRef,
  getInterfaceStandardsByKind,
  getNamingStandardById,
  getPolicySetByDomain,
  getVersionStandardById,
  isTechnicalStandardsFreezeLockIntact,
  isTechnicalStandardsRefsAligned,
  isTechnicalStandardsRegistryIdKnown,
  isUpstreamCodeGovernanceLockIntact,
  runTechnicalStandards,
  technicalStandardsFreezeLockMatchesExpected,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p4-technical-standards";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/technical-standards/technical-standards.ts",
    "lib/technical-governance/v69/technical-standards/standards.types.ts",
    "lib/technical-governance/v69/technical-standards/standards.constants.ts",
    "lib/technical-governance/v69/technical-standards/standards.surface.ts",
    "lib/technical-governance/v69/technical-standards/standards.builder.ts",
    "lib/technical-governance/v69/technical-standards/standards.entry.ts",
    "lib/technical-governance/v69/technical-standards/standards.registry.ts",
    "lib/technical-governance/v69/technical-standards/freeze.lock.ts",
    "lib/technical-governance/v69/technical-standards/rollback.index.ts",
    "lib/technical-governance/v69/technical-standards/policy.set.catalog.ts",
    "lib/technical-governance/v69/technical-standards/naming.standard.catalog.ts",
    "lib/technical-governance/v69/technical-standards/version.standard.catalog.ts",
    "lib/technical-governance/v69/technical-standards/interface.standard.catalog.ts",
    "lib/technical-governance/v69/technical-standards/directory.standard.catalog.ts",
    "lib/technical-governance/v69/technical-standards/change.standard.catalog.ts",
    "lib/technical-governance/v69/technical-standards/alignment.catalog.ts",
    "docs/technical-governance/V69-TECHNICAL-STANDARDS.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 technical standards module structure");
}

function testInventories() {
  check(STANDARD_POLICY_SET_CATALOG.length >= 6, "policy set catalog");
  check(NAMING_STANDARD_CATALOG.length >= 6, "naming standard catalog");
  check(VERSION_STANDARD_CATALOG.length >= 6, "version standard catalog");
  check(INTERFACE_STANDARD_CATALOG.length >= 6, "interface standard catalog");
  check(DIRECTORY_STANDARD_CATALOG.length >= 6, "directory standard catalog");
  check(CHANGE_STANDARD_CATALOG.length >= 6, "change standard catalog");
  check(isUpstreamCodeGovernanceLockIntact(), "upstream code governance lock intact");
  check(isTechnicalStandardsFreezeLockIntact(), "freeze lock intact");
  check(technicalStandardsFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ policy set, naming, version, interface, directory, change & locks");
}

function testCrossReferences() {
  check(isTechnicalStandardsRefsAligned(), "technical standards refs aligned");

  const nam001 = getNamingStandardById("TSTD-NAM-001");
  check(nam001?.example === "ARC-DEF-001", "TSTD-NAM-001 example");

  const ver001 = getVersionStandardById("TSTD-VER-001");
  check(ver001?.versionPattern.includes("v69") === true, "TSTD-VER-001 pattern");

  const ifcVerify = getInterfaceStandardsByKind("verify");
  check(ifcVerify.length >= 1, "verify interface standards");

  const dirBnd = getDirectoryStandardByBoundaryRef("CGOV-BND-003");
  check(dirBnd?.pathConvention.includes("technical-governance") === true, "CGOV-BND-003 directory std");

  const changeFrozen = getChangeStandardsByKind("frozen");
  check(changeFrozen.length >= 2, "frozen change standards");

  const namingPolicies = getPolicySetByDomain("naming");
  check(namingPolicies.length >= 1, "naming policy set domain");

  check(
    V69_UPSTREAM_CODE_GOVERNANCE_LOCK.codeGovernance.length > 0,
    "P3 governance version in lock",
  );
  check(
    V69_TECHNICAL_STANDARDS_FREEZE_LOCK.technicalStandards === V69_TECHNICAL_STANDARDS_VERSION,
    "freeze lock standards version",
  );
  console.log("✓ cross-references & P1–P3 upstream");
}

function testRegistryAndRollback() {
  const registry = buildTechnicalStandardsRegistry();
  check(registry.registryComplete, "technical standards registry complete");
  check(registry.totalEntries >= 40, "registry total entries");
  check(isTechnicalStandardsRegistryIdKnown("naming", "TSTD-NAM-001"), "registry knows TSTD-NAM-001");
  check(
    TECHNICAL_STANDARDS_REGISTRY_INDEX.policySet.length === STANDARD_POLICY_SET_CATALOG.length,
    "registry policy set index synced",
  );

  const rollback = buildTechnicalStandardsRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(TECHNICAL_STANDARDS_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ technical standards registry & rollback index");
}

function testManifests() {
  check(buildStandardPolicySetManifest().catalogComplete, "policy set manifest complete");
  check(buildNamingStandardManifest().catalogComplete, "naming manifest complete");
  check(buildVersionStandardManifest().catalogComplete, "version manifest complete");
  check(buildInterfaceStandardManifest().catalogComplete, "interface manifest complete");
  check(buildDirectoryStandardManifest().catalogComplete, "directory manifest complete");
  check(buildChangeStandardManifest().catalogComplete, "change manifest complete");
  console.log("✓ technical standards manifests");
}

function testReport() {
  const incomplete = runTechnicalStandards({
    deploymentId: DEPLOYMENT_ID,
    signals: { codeGovernanceReady: false },
  });
  check(!incomplete.standardsReady, "incomplete governance not ready");

  const ready = buildTechnicalStandardsReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_TECHNICAL_STANDARDS_VERSION, "standards version");
  check(ready.codeGovernanceReady, "code governance ready");
  check(ready.policySet.catalogComplete, "policy set complete");
  check(ready.naming.catalogComplete, "naming complete");
  check(ready.versioning.catalogComplete, "versioning complete");
  check(ready.interfaces.catalogComplete, "interfaces complete");
  check(ready.directories.catalogComplete, "directories complete");
  check(ready.changes.catalogComplete, "changes complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.standardsReady, "standards ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertTechnicalStandardsPass(ready);

  check(
    V69_TECHNICAL_STANDARDS_ARTIFACT_SURFACE.verifyStandards.includes("verify:v69-p4"),
    "artifact surface verify script",
  );

  console.log("✓ technical standards report");
  console.log(formatTechnicalStandardsSummary(ready));
  console.log("\n✅ V69 P4 Technical Standards — verify PASS");
}

function main() {
  console.log("V69 P4 Technical Standards Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
