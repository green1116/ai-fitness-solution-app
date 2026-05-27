/**
 * V3.7-H11 Enterprise Role Catalog & Access Governance — smoke verification
 */
import {
  PRODUCTION_GOVERNANCE_VERSION,
  GOVERNANCE_VERSION,
  GOVERNANCE_MANIFEST_VERSION,
  ROLE_CATALOG_DTO_VERSION,
  ACCESS_GOVERNANCE_VERSION,
  PERMISSION_LINEAGE_VERSION,
  buildProductionGovernanceFoundation,
  buildRoleCatalogDto,
  buildAccessGovernance,
  buildPermissionLineage,
  buildGovernanceManifest,
  type RoleCatalogEntry,
  type AccessGovernance,
  type PermissionLineage,
} from "../lib/commercialization/governance/index";

const REQUIRED_ROLES = [
  "ops-viewer",
  "release-reviewer",
  "audit-reviewer",
  "enterprise-admin",
] as const;

const ROLE_CATALOG_FIELDS: (keyof RoleCatalogEntry)[] = [
  "roleId",
  "roleName",
  "roleCategory",
  "permissions",
  "accessibleResources",
  "governanceScope",
  "readonlyAccess",
];

const GOVERNANCE_KEYS: (keyof AccessGovernance)[] = [
  "version",
  "governanceId",
  "governanceSummary",
  "roleCoverage",
  "resourceCoverage",
  "permissionCoverage",
  "readonlyAccessCoverage",
  "effectiveGovernance",
  "summary",
];

const LINEAGE_KEYS: (keyof PermissionLineage)[] = [
  "version",
  "lineageId",
  "roleLineage",
  "permissionLineage",
  "resourceLineage",
  "inheritedAccess",
  "readonlyExplanations",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testRoleCatalogShape() {
  const catalog = buildRoleCatalogDto({ deploymentId: "h11-catalog" });
  assert(catalog.version === ROLE_CATALOG_DTO_VERSION, "catalog version");
  assert(catalog.catalogId.includes("RCT-V37H11"), "catalog id");
  assert(catalog.entries.length === 4, "role count");
  assert(catalog.defaultRoleId === "ops-viewer", "default role");

  for (const role of REQUIRED_ROLES) {
    assert(catalog.entries.some((e) => e.roleId === role), `missing role ${role}`);
  }

  for (const entry of catalog.entries) {
    for (const field of ROLE_CATALOG_FIELDS) {
      assert(field in entry, `role catalog missing ${String(field)}`);
    }
    assert(entry.readonlyAccess === true, "readonly access");
    assert(entry.governanceScope.length > 0, "governance scope");
  }

  console.log("✓ role catalog shape");
  console.log(" ", catalog.summary);
}

function testGovernanceSummary() {
  const governance = buildAccessGovernance({ deploymentId: "h11-governance" });
  assert(governance.version === ACCESS_GOVERNANCE_VERSION, "governance version");
  assert(governance.governanceId.includes("GOV-V37H11"), "governance id");
  assert(governance.governanceSummary.length > 0, "governance summary");
  assert(governance.roleCoverage.covered > 0, "role coverage");
  assert(governance.resourceCoverage.covered > 0, "resource coverage");
  assert(governance.permissionCoverage.covered > 0, "permission coverage");
  assert(governance.readonlyAccessCoverage.ratio === 100, "readonly coverage");
  assert(governance.effectiveGovernance.length > 0, "effective governance");

  for (const key of GOVERNANCE_KEYS) {
    assert(key in governance, `governance shape missing ${String(key)}`);
  }

  console.log("✓ governance summary");
  console.log(" ", governance.summary);
}

function testPermissionLineage() {
  const lineage = buildPermissionLineage({ deploymentId: "h11-lineage" });
  assert(lineage.version === PERMISSION_LINEAGE_VERSION, "lineage version");
  assert(lineage.lineageId.includes("LIN-V37H11"), "lineage id");
  assert(lineage.roleLineage.length === 4, "role lineage");
  assert(lineage.permissionLineage.length > 0, "permission lineage");
  assert(lineage.resourceLineage.length >= 5, "resource lineage");
  assert(lineage.inheritedAccess.length === 4, "inherited access");
  assert(lineage.readonlyExplanations.length > 0, "readonly explanations");

  for (const key of LINEAGE_KEYS) {
    assert(key in lineage, `lineage shape missing ${String(key)}`);
  }

  console.log("✓ permission lineage");
  console.log(" ", lineage.summary);
}

function testGovernanceManifest() {
  const manifest = buildGovernanceManifest({ deploymentId: "h11-manifest" });
  assert(manifest.version === GOVERNANCE_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("GMF-V37H11"), "manifest id");
  assert(manifest.GOVERNANCE_VERSION === GOVERNANCE_VERSION, "governance version ref");
  assert(manifest.ACCESS_MATRIX_VERSION.length > 0, "matrix version");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.AUDIT_VERSION.length > 0, "audit version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(manifest.readyForGovernance === true, "ready for governance");
  assert(manifest.readyForOps === true, "ready for ops");
  assert(manifest.readyForReview === true, "ready for review");

  console.log("✓ governance manifest");
  console.log(" ", manifest.summary);
}

function testReadonlyGovernanceCoverage() {
  const foundation = buildProductionGovernanceFoundation({ deploymentId: "h11-foundation" });
  assert(foundation.version === PRODUCTION_GOVERNANCE_VERSION, "foundation version");
  assert(foundation.foundationId.includes("PGF-V37H11"), "foundation id");
  assert(foundation.manifest.readyForGovernance, "ready for governance");
  assert(foundation.roleCatalog.entries.every((e) => e.readonlyAccess), "all readonly");
  assert(foundation.governance.readonlyAccessCoverage.ratio === 100, "readonly ratio");
  assert(foundation.lineage.readonlyExplanations.every((e) => e.includes("readonly")), "explanations");

  console.log("✓ readonly governance coverage");
  console.log(" ", foundation.summary);
}

function main() {
  testRoleCatalogShape();
  testGovernanceSummary();
  testPermissionLineage();
  testGovernanceManifest();
  testReadonlyGovernanceCoverage();
  console.log("\nAll governance surface checks passed.");
}

main();
