/**
 * V3.7-H12 Governance Review API & Enterprise Governance Portal — smoke verification
 */
import {
  PRODUCTION_GOVERNANCE_VERSION,
  PERMISSION_LINEAGE_VERSION,
  buildProductionGovernanceFoundation,
  buildPermissionLineage,
  type ProductionGovernanceFoundation,
  type PermissionLineage,
} from "../lib/commercialization/governance/index";

const GOVERNANCE_API_KEYS: (keyof ProductionGovernanceFoundation)[] = [
  "version",
  "foundationId",
  "roleCatalog",
  "governance",
  "lineage",
  "manifest",
  "summary",
];

const PERMISSION_LINEAGE_API_KEYS: (keyof PermissionLineage)[] = [
  "version",
  "lineageId",
  "roleLineage",
  "permissionLineage",
  "resourceLineage",
  "inheritedAccess",
  "readonlyExplanations",
  "summary",
];

const GOVERNANCE_REVIEW_PAGE_FIELDS = [
  "roleCoverage",
  "resourceCoverage",
  "permissionCoverage",
  "effectiveGovernance",
] as const;

const PERMISSION_LINEAGE_PAGE_FIELDS = [
  "roleLineage",
  "permissionLineage",
  "inheritedAccess",
  "readonlyExplanations",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testGovernanceApiShape() {
  const foundation = buildProductionGovernanceFoundation({ deploymentId: "h12-governance-api" });
  assert(foundation.version === PRODUCTION_GOVERNANCE_VERSION, "foundation version");
  for (const key of GOVERNANCE_API_KEYS) {
    assert(key in foundation, `governance API missing ${String(key)}`);
  }
  assert(foundation.manifest.readyForGovernance, "ready for governance");
  assert(foundation.roleCatalog.entries.length === 4, "role catalog");
  assert(foundation.governance.effectiveGovernance.length > 0, "effective governance");

  console.log("✓ governance API shape");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/governance foundationId=${foundation.foundationId}`,
  );
}

function testPermissionLineageApiShape() {
  const lineage = buildPermissionLineage({ deploymentId: "h12-lineage-api" });
  assert(lineage.version === PERMISSION_LINEAGE_VERSION, "lineage version");
  for (const key of PERMISSION_LINEAGE_API_KEYS) {
    assert(key in lineage, `permission lineage API missing ${String(key)}`);
  }
  assert(lineage.roleLineage.length === 4, "role lineage");
  assert(lineage.permissionLineage.length > 0, "permission lineage");
  assert(lineage.inheritedAccess.length === 4, "inherited access");
  assert(lineage.readonlyExplanations.length > 0, "readonly explanations");

  console.log("✓ permission lineage API shape");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/permission-lineage lineageId=${lineage.lineageId}`,
  );
}

function testGovernanceReviewPageShape() {
  const foundation = buildProductionGovernanceFoundation({ deploymentId: "h12-governance-page" });
  const { governance } = foundation;

  const pageData: Record<(typeof GOVERNANCE_REVIEW_PAGE_FIELDS)[number], unknown> = {
    roleCoverage: governance.roleCoverage,
    resourceCoverage: governance.resourceCoverage,
    permissionCoverage: governance.permissionCoverage,
    effectiveGovernance: governance.effectiveGovernance,
  };

  for (const field of GOVERNANCE_REVIEW_PAGE_FIELDS) {
    assert(field in pageData, `governance review page missing ${field}`);
    const value = pageData[field];
    if (Array.isArray(value)) {
      assert(value.length > 0, `page field empty array: ${field}`);
    } else {
      assert(value !== undefined, `page field undefined: ${field}`);
    }
  }

  console.log("✓ governance review page shape");
  console.log(
    " ",
    `route=/dashboard/governance-review effective=${governance.effectiveGovernance.length} roleCoverage=${governance.roleCoverage.ratio}%`,
  );
}

function testPermissionLineagePageShape() {
  const lineage = buildPermissionLineage({ deploymentId: "h12-lineage-page" });

  const pageData: Record<(typeof PERMISSION_LINEAGE_PAGE_FIELDS)[number], unknown> = {
    roleLineage: lineage.roleLineage,
    permissionLineage: lineage.permissionLineage,
    inheritedAccess: lineage.inheritedAccess,
    readonlyExplanations: lineage.readonlyExplanations,
  };

  for (const field of PERMISSION_LINEAGE_PAGE_FIELDS) {
    assert(field in pageData, `permission lineage page missing ${field}`);
    const value = pageData[field];
    if (Array.isArray(value)) {
      assert(value.length > 0, `page field empty array: ${field}`);
    } else {
      assert(value !== undefined, `page field undefined: ${field}`);
    }
  }

  console.log("✓ permission lineage page shape");
  console.log(" ", `route=/dashboard/permission-lineage explanations=${lineage.readonlyExplanations.length}`);
}

function main() {
  testGovernanceApiShape();
  testPermissionLineageApiShape();
  testGovernanceReviewPageShape();
  testPermissionLineagePageShape();
  console.log("\nAll governance API checks passed.");
}

main();
