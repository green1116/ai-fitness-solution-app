/**
 * V69 P3 — Code Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  CODE_GOVERNANCE_OBJECT_CATALOG,
  CODE_GOVERNANCE_REGISTRY_INDEX,
  CODE_GOVERNANCE_ROLLBACK_INDEX,
  CODE_POLICY_CATALOG,
  DIRECTORY_BOUNDARY_CATALOG,
  FILE_OWNERSHIP_CATALOG,
  IMPORT_ALLOWANCE_CATALOG,
  V69_CODE_GOVERNANCE_ARTIFACT_SURFACE,
  V69_CODE_GOVERNANCE_FREEZE_LOCK,
  V69_CODE_GOVERNANCE_VERSION,
  V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK,
  assertCodeGovernancePass,
  buildCodeGovernanceObjectManifest,
  buildCodeGovernanceRegistry,
  buildCodeGovernanceReport,
  buildCodeGovernanceRollbackIndex,
  buildCodePolicyManifest,
  buildDirectoryBoundaryManifest,
  buildFileOwnershipManifest,
  buildImportAllowanceManifest,
  codeGovernanceFreezeLockMatchesExpected,
  formatCodeGovernanceSummary,
  getBoundaryByCodeObjectRef,
  getCodeObjectByArcDefRef,
  getCodePolicyById,
  getImportAllowancesFromBoundary,
  getOwnershipByBoundaryRef,
  isCodeGovernanceFreezeLockIntact,
  isCodeGovernanceRefsAligned,
  isCodeGovernanceRegistryIdKnown,
  isImportAllowed,
  isUpstreamArchitectureDependencyLockIntact,
  runCodeGovernance,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p3-code-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/code-governance/code-governance.ts",
    "lib/technical-governance/v69/code-governance/governance.types.ts",
    "lib/technical-governance/v69/code-governance/governance.constants.ts",
    "lib/technical-governance/v69/code-governance/governance.surface.ts",
    "lib/technical-governance/v69/code-governance/governance.builder.ts",
    "lib/technical-governance/v69/code-governance/governance.entry.ts",
    "lib/technical-governance/v69/code-governance/governance.registry.ts",
    "lib/technical-governance/v69/code-governance/freeze.lock.ts",
    "lib/technical-governance/v69/code-governance/rollback.index.ts",
    "lib/technical-governance/v69/code-governance/code.object.catalog.ts",
    "lib/technical-governance/v69/code-governance/code.policy.catalog.ts",
    "lib/technical-governance/v69/code-governance/directory.boundary.catalog.ts",
    "lib/technical-governance/v69/code-governance/file.ownership.catalog.ts",
    "lib/technical-governance/v69/code-governance/import.allowance.catalog.ts",
    "lib/technical-governance/v69/code-governance/alignment.catalog.ts",
    "docs/technical-governance/V69-CODE-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 code governance module structure");
}

function testInventories() {
  check(CODE_GOVERNANCE_OBJECT_CATALOG.length >= 6, "code object catalog");
  check(CODE_POLICY_CATALOG.length >= 6, "code policy catalog");
  check(DIRECTORY_BOUNDARY_CATALOG.length >= 6, "directory boundary catalog");
  check(FILE_OWNERSHIP_CATALOG.length >= 6, "file ownership catalog");
  check(IMPORT_ALLOWANCE_CATALOG.length >= 6, "import allowance catalog");
  check(isUpstreamArchitectureDependencyLockIntact(), "upstream dependency lock intact");
  check(isCodeGovernanceFreezeLockIntact(), "freeze lock intact");
  check(codeGovernanceFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ objects, policies, boundaries, ownerships, allowances & locks");
}

function testCrossReferences() {
  check(isCodeGovernanceRefsAligned(), "code governance refs aligned");

  const obj001 = getCodeObjectByArcDefRef("ARC-DEF-001");
  check(obj001?.dependencyEntryRef === "ARC-DEP-001", "ARC-DEF-001 dependency entry ref");

  const bnd001 = getBoundaryByCodeObjectRef("CGOV-OBJ-001");
  check(bnd001?.pathPattern === "app/**", "CGOV-OBJ-001 boundary path");

  const own001 = getOwnershipByBoundaryRef("CGOV-BND-001");
  check(own001?.ownerRole === "frontend-lead", "CGOV-BND-001 ownership");

  const imports = getImportAllowancesFromBoundary("CGOV-BND-002");
  check(imports.length >= 2, "CGOV-BND-002 import allowances");

  check(
    isImportAllowed({ fromBoundaryRef: "CGOV-BND-002", toBoundaryRef: "CGOV-BND-003" }),
    "api → lib import allowed",
  );

  const pol001 = getCodePolicyById("CGOV-POL-001");
  check(pol001?.kind === "frozen-layer", "frozen layer policy");

  check(
    V69_UPSTREAM_ARCHITECTURE_DEPENDENCY_LOCK.architectureDependency.length > 0,
    "P2 dependency version in lock",
  );
  check(
    V69_CODE_GOVERNANCE_FREEZE_LOCK.codeGovernance === V69_CODE_GOVERNANCE_VERSION,
    "freeze lock governance version",
  );
  console.log("✓ cross-references, import rules & P1–P2 upstream");
}

function testRegistryAndRollback() {
  const registry = buildCodeGovernanceRegistry();
  check(registry.registryComplete, "code governance registry complete");
  check(registry.totalEntries >= 32, "registry total entries");
  check(isCodeGovernanceRegistryIdKnown("policies", "CGOV-POL-001"), "registry knows CGOV-POL-001");
  check(
    CODE_GOVERNANCE_REGISTRY_INDEX.objects.length === CODE_GOVERNANCE_OBJECT_CATALOG.length,
    "registry object index synced",
  );

  const rollback = buildCodeGovernanceRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(CODE_GOVERNANCE_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ code governance registry & rollback index");
}

function testManifests() {
  check(buildCodeGovernanceObjectManifest().catalogComplete, "object manifest complete");
  check(buildCodePolicyManifest().catalogComplete, "policy manifest complete");
  check(buildDirectoryBoundaryManifest().catalogComplete, "boundary manifest complete");
  check(buildFileOwnershipManifest().catalogComplete, "ownership manifest complete");
  check(buildImportAllowanceManifest().catalogComplete, "import allowance manifest complete");
  console.log("✓ code governance manifests");
}

function testReport() {
  const incomplete = runCodeGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { architectureDependencyReady: false },
  });
  check(!incomplete.governanceReady, "incomplete dependency not ready");

  const ready = buildCodeGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_CODE_GOVERNANCE_VERSION, "governance version");
  check(ready.architectureDependencyReady, "architecture dependency ready");
  check(ready.objects.catalogComplete, "objects complete");
  check(ready.policies.catalogComplete, "policies complete");
  check(ready.boundaries.catalogComplete, "boundaries complete");
  check(ready.ownerships.catalogComplete, "ownerships complete");
  check(ready.importAllowances.catalogComplete, "import allowances complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertCodeGovernancePass(ready);

  check(
    V69_CODE_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v69-p3"),
    "artifact surface verify script",
  );

  console.log("✓ code governance report");
  console.log(formatCodeGovernanceSummary(ready));
  console.log("\n✅ V69 P3 Code Governance — verify PASS");
}

function main() {
  console.log("V69 P3 Code Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
