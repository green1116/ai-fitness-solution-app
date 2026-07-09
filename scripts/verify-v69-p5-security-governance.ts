/**
 * V69 P5 — Security Governance Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ACCESS_STANDARD_CATALOG,
  AUDIT_STANDARD_CATALOG,
  PERMISSION_STANDARD_CATALOG,
  RISK_CONTROL_CATALOG,
  SECURITY_BOUNDARY_CATALOG,
  SECURITY_GOVERNANCE_OBJECT_CATALOG,
  SECURITY_GOVERNANCE_REGISTRY_INDEX,
  SECURITY_GOVERNANCE_ROLLBACK_INDEX,
  SECURITY_POLICY_CATALOG,
  SENSITIVE_SURFACE_CATALOG,
  V69_SECURITY_GOVERNANCE_ARTIFACT_SURFACE,
  V69_SECURITY_GOVERNANCE_FREEZE_LOCK,
  V69_SECURITY_GOVERNANCE_VERSION,
  V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK,
  assertSecurityGovernancePass,
  buildAccessStandardManifest,
  buildAuditStandardManifest,
  buildPermissionStandardManifest,
  buildRiskControlManifest,
  buildSecurityBoundaryManifest,
  buildSecurityGovernanceObjectManifest,
  buildSecurityGovernanceRegistry,
  buildSecurityGovernanceReport,
  buildSecurityGovernanceRollbackIndex,
  buildSecurityPolicyManifest,
  buildSensitiveSurfaceManifest,
  computeDeclarativeRiskAcceptance,
  formatSecurityGovernanceSummary,
  getAccessStandardByBoundaryRef,
  getAuditStandardsByPolicyRef,
  getPermissionStandardByBoundaryRef,
  getRiskControlsBySurfaceRef,
  getSecurityBoundaryById,
  getSecurityObjectById,
  getSecurityPolicyById,
  getSensitiveSurfaceById,
  isSecurityGovernanceFreezeLockIntact,
  isSecurityGovernanceRefsAligned,
  isSecurityGovernanceRegistryIdKnown,
  isUpstreamTechnicalStandardsLockIntact,
  runSecurityGovernance,
  securityGovernanceFreezeLockMatchesExpected,
} from "../lib/technical-governance/v69";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v69-p5-security-governance";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/technical-governance/v69/security-governance/security-governance.ts",
    "lib/technical-governance/v69/security-governance/governance.types.ts",
    "lib/technical-governance/v69/security-governance/governance.constants.ts",
    "lib/technical-governance/v69/security-governance/governance.surface.ts",
    "lib/technical-governance/v69/security-governance/governance.builder.ts",
    "lib/technical-governance/v69/security-governance/governance.entry.ts",
    "lib/technical-governance/v69/security-governance/governance.registry.ts",
    "lib/technical-governance/v69/security-governance/freeze.lock.ts",
    "lib/technical-governance/v69/security-governance/rollback.index.ts",
    "lib/technical-governance/v69/security-governance/security.object.catalog.ts",
    "lib/technical-governance/v69/security-governance/security.policy.catalog.ts",
    "lib/technical-governance/v69/security-governance/security.boundary.catalog.ts",
    "lib/technical-governance/v69/security-governance/sensitive.surface.catalog.ts",
    "lib/technical-governance/v69/security-governance/access.standard.catalog.ts",
    "lib/technical-governance/v69/security-governance/permission.standard.catalog.ts",
    "lib/technical-governance/v69/security-governance/audit.standard.catalog.ts",
    "lib/technical-governance/v69/security-governance/risk.standard.catalog.ts",
    "lib/technical-governance/v69/security-governance/alignment.catalog.ts",
    "docs/technical-governance/V69-SECURITY-GOVERNANCE.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V69 security governance module structure");
}

function testInventories() {
  check(SECURITY_GOVERNANCE_OBJECT_CATALOG.length >= 6, "security object catalog");
  check(SECURITY_POLICY_CATALOG.length >= 6, "security policy catalog");
  check(SECURITY_BOUNDARY_CATALOG.length >= 6, "security boundary catalog");
  check(SENSITIVE_SURFACE_CATALOG.length >= 6, "sensitive surface catalog");
  check(ACCESS_STANDARD_CATALOG.length >= 6, "access standard catalog");
  check(PERMISSION_STANDARD_CATALOG.length >= 6, "permission standard catalog");
  check(AUDIT_STANDARD_CATALOG.length >= 6, "audit standard catalog");
  check(RISK_CONTROL_CATALOG.length >= 6, "risk control catalog");
  check(isUpstreamTechnicalStandardsLockIntact(), "upstream technical standards lock intact");
  check(isSecurityGovernanceFreezeLockIntact(), "freeze lock intact");
  check(securityGovernanceFreezeLockMatchesExpected(), "freeze lock matches expected");
  console.log("✓ objects, policies, boundaries, surfaces, standards & locks");
}

function testCrossReferences() {
  check(isSecurityGovernanceRefsAligned(), "security governance refs aligned");

  const secObj = getSecurityObjectById("SEC-OBJ-001");
  check(secObj?.arcDefRef === "ARC-DEF-008", "SEC-OBJ-001 arc def ref");

  const bnd = getSecurityBoundaryById("SEC-BND-001");
  check(bnd?.codeBoundaryRef === "CGOV-BND-008", "SEC-BND-001 code boundary ref");

  const sur = getSensitiveSurfaceById("SEC-SUR-002");
  check(sur?.kind === "credential", "SEC-SUR-002 credential surface");

  const acc = getAccessStandardByBoundaryRef("SEC-BND-003");
  check(acc?.authRequired === true, "SEC-BND-003 access auth required");

  const perm = getPermissionStandardByBoundaryRef("SEC-BND-001");
  check(perm?.permissionModel === "rbac-security-admin", "SEC-BND-001 permission model");

  const audits = getAuditStandardsByPolicyRef("SEC-POL-004");
  check(audits.length >= 2, "SEC-POL-004 audit standards");

  const risks = getRiskControlsBySurfaceRef("SEC-SUR-002");
  check(risks.length >= 1, "SEC-SUR-002 risk controls");

  check(
    computeDeclarativeRiskAcceptance({
      riskLevel: "critical",
      controlKind: "encryption-at-rest",
    }),
    "declarative risk acceptance critical",
  );

  const pol = getSecurityPolicyById("SEC-POL-001");
  check(pol?.kind === "authentication", "SEC-POL-001 authentication policy");

  check(
    V69_UPSTREAM_TECHNICAL_STANDARDS_LOCK.technicalStandards.length > 0,
    "P4 standards version in lock",
  );
  check(
    V69_SECURITY_GOVERNANCE_FREEZE_LOCK.securityGovernance === V69_SECURITY_GOVERNANCE_VERSION,
    "freeze lock governance version",
  );
  console.log("✓ cross-references & P1–P4 upstream");
}

function testRegistryAndRollback() {
  const registry = buildSecurityGovernanceRegistry();
  check(registry.registryComplete, "security governance registry complete");
  check(registry.totalEntries >= 56, "registry total entries");
  check(isSecurityGovernanceRegistryIdKnown("policies", "SEC-POL-001"), "registry knows SEC-POL-001");
  check(
    SECURITY_GOVERNANCE_REGISTRY_INDEX.boundaries.length === SECURITY_BOUNDARY_CATALOG.length,
    "registry boundary index synced",
  );

  const rollback = buildSecurityGovernanceRollbackIndex();
  check(rollback.indexComplete, "rollback index complete");
  check(SECURITY_GOVERNANCE_ROLLBACK_INDEX.length >= 4, "rollback entries");
  console.log("✓ security governance registry & rollback index");
}

function testManifests() {
  check(buildSecurityGovernanceObjectManifest().catalogComplete, "object manifest complete");
  check(buildSecurityPolicyManifest().catalogComplete, "policy manifest complete");
  check(buildSecurityBoundaryManifest().catalogComplete, "boundary manifest complete");
  check(buildSensitiveSurfaceManifest().catalogComplete, "surface manifest complete");
  check(buildAccessStandardManifest().catalogComplete, "access manifest complete");
  check(buildPermissionStandardManifest().catalogComplete, "permission manifest complete");
  check(buildAuditStandardManifest().catalogComplete, "audit manifest complete");
  check(buildRiskControlManifest().catalogComplete, "risk manifest complete");
  console.log("✓ security governance manifests");
}

function testReport() {
  const incomplete = runSecurityGovernance({
    deploymentId: DEPLOYMENT_ID,
    signals: { technicalStandardsReady: false },
  });
  check(!incomplete.governanceReady, "incomplete standards not ready");

  const ready = buildSecurityGovernanceReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V69_SECURITY_GOVERNANCE_VERSION, "governance version");
  check(ready.technicalStandardsReady, "technical standards ready");
  check(ready.objects.catalogComplete, "objects complete");
  check(ready.policies.catalogComplete, "policies complete");
  check(ready.boundaries.catalogComplete, "boundaries complete");
  check(ready.sensitiveSurfaces.catalogComplete, "surfaces complete");
  check(ready.accessStandards.catalogComplete, "access complete");
  check(ready.permissionStandards.catalogComplete, "permissions complete");
  check(ready.auditStandards.catalogComplete, "audit complete");
  check(ready.riskControls.catalogComplete, "risk complete");
  check(ready.registry.registryComplete, "registry complete");
  check(ready.governanceReady, "governance ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertSecurityGovernancePass(ready);

  check(
    V69_SECURITY_GOVERNANCE_ARTIFACT_SURFACE.verifyGovernance.includes("verify:v69-p5"),
    "artifact surface verify script",
  );

  console.log("✓ security governance report");
  console.log(formatSecurityGovernanceSummary(ready));
  console.log("\n✅ V69 P5 Security Governance — verify PASS");
}

function main() {
  console.log("V69 P5 Security Governance Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testRegistryAndRollback();
  testManifests();
  testReport();
}

main();
