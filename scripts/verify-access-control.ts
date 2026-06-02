/**
 * V3.7-H9 Production Access Matrix & Policy Review — smoke verification
 */
import { BUILD_FREEZE_MANIFEST } from "../lib/commercialization/stabilization/build-freeze";
import {
  PRODUCTION_ACCESS_CONTROL_VERSION,
  ACCESS_MATRIX_DTO_VERSION,
  ACCESS_MATRIX_VERSION,
  ACCESS_MANIFEST_VERSION,
  POLICY_REVIEW_VERSION,
  buildProductionAccessControlFoundation,
  buildAccessMatrixDto,
  buildAccessMatrix,
  buildAccessMatrixSummary,
  buildPolicyReview,
  buildAccessManifest,
  type AccessMatrix,
  type PolicyReview,
} from "../lib/commercialization/access";

const MATRIX_KEYS: (keyof AccessMatrix)[] = [
  "version",
  "matrixId",
  "defaultRole",
  "roleCount",
  "resourceCount",
  "grantedCount",
  "dto",
  "policyReview",
  "summary",
];

const POLICY_REVIEW_KEYS: (keyof PolicyReview)[] = [
  "version",
  "reviewId",
  "roleSummary",
  "resourceSummary",
  "permissionSummary",
  "denySummary",
  "allowSummary",
  "effectiveAccess",
  "summary",
];

const REQUIRED_RESOURCES = [
  "release-ledger",
  "evidence-export",
  "audit-review",
  "dashboard",
  "commercial-ops",
] as const;

const REQUIRED_ROLES = [
  "ops-viewer",
  "release-reviewer",
  "audit-reviewer",
  "enterprise-admin",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testAccessMatrixShape() {
  const matrix = buildAccessMatrix({ deploymentId: "h9-matrix" });
  assert(matrix.version === ACCESS_MATRIX_VERSION, "matrix version");
  assert(matrix.matrixId.includes("MAT-V37H9"), "matrix id");
  assert(matrix.dto.matrixVersion === ACCESS_MATRIX_DTO_VERSION, "dto version");
  assert(matrix.defaultRole === "ops-viewer", "default role");
  assert(matrix.roleCount === 4, "role count");
  assert(matrix.resourceCount >= 5, "resource count");
  assert(matrix.grantedCount > 0, "granted count");

  for (const key of MATRIX_KEYS) {
    assert(key in matrix, `matrix shape missing ${key}`);
  }

  console.log("✓ access matrix shape");
  console.log(" ", matrix.summary);
}

function testPolicyReviewSummary() {
  const review = buildPolicyReview({ deploymentId: "h9-policy" });
  assert(review.version === POLICY_REVIEW_VERSION, "policy review version");
  assert(review.reviewId.includes("PRV-V37H9"), "review id");
  assert(review.roleSummary.includes("roles=4"), "role summary");
  assert(review.resourceSummary.includes("resources="), "resource summary");
  assert(review.permissionSummary.includes("granted="), "permission summary");
  assert(review.effectiveAccess.length > 0, "effective access");
  assert(review.effectiveAccess.every((e) => e.explanation.length > 0), "explanations");

  for (const key of POLICY_REVIEW_KEYS) {
    assert(key in review, `policy review shape missing ${key}`);
  }

  console.log("✓ policy review summary");
  console.log(" ", review.summary);
}

function testManifestVersion() {
  const manifest = buildAccessManifest({ deploymentId: "h9-manifest" });
  assert(manifest.version === ACCESS_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("ACM-V37H9"), "manifest id");
  assert(manifest.ACCESS_MATRIX_VERSION === ACCESS_MATRIX_VERSION, "matrix version ref");
  assert(manifest.OPS_PORTAL_VERSION.length > 0, "ops portal version");
  assert(manifest.AUDIT_VERSION.length > 0, "audit version");
  assert(manifest.RELEASE_LEDGER_VERSION.length > 0, "release ledger version");
  assert(manifest.buildPassed === BUILD_FREEZE_MANIFEST.buildPassed, "build passed");
  assert(manifest.tscPassed === BUILD_FREEZE_MANIFEST.tscPassed, "tsc passed");
  assert(manifest.verificationPassed, "verification passed");
  assert(manifest.readyForOps, "ready for ops");
  assert(manifest.readyForReview, "ready for review");

  console.log("✓ manifest version");
  console.log(" ", manifest.summary);
}

function testResourceRoleCoverage() {
  const dto = buildAccessMatrixDto({ deploymentId: "h9-coverage" });
  const resourceIds = dto.resources.map((r) => r.id);
  const roleIds = dto.roles.map((r) => r.id);

  for (const resource of REQUIRED_RESOURCES) {
    assert(resourceIds.includes(resource), `missing resource ${resource}`);
  }
  for (const role of REQUIRED_ROLES) {
    assert(roleIds.includes(role), `missing role ${role}`);
  }

  assert(dto.permissions.length === dto.roles.length * dto.resources.length, "permission grid");
  assert(dto.allowRules.length + dto.denyRules.length === dto.resources.length, "rule coverage");

  console.log("✓ resource / role coverage");
  console.log(" ", `roles=${roleIds.length} resources=${resourceIds.length} permissions=${dto.permissions.length}`);
}

function testReadonlyAccessExplanation() {
  const foundation = buildProductionAccessControlFoundation({ deploymentId: "h9-foundation" });
  assert(foundation.version === PRODUCTION_ACCESS_CONTROL_VERSION, "foundation version");
  assert(foundation.manifest.readyForReview, "ready for review");

  const adminAccess = foundation.policyReview.effectiveAccess.filter(
    (e) => e.roleId === "enterprise-admin" && e.granted,
  );
  assert(adminAccess.length >= 5, "enterprise admin grants");

  const summary = buildAccessMatrixSummary({ deploymentId: "h9-summary" });
  assert(summary.includes("access-matrix"), "matrix summary");

  console.log("✓ readonly access explanation");
  console.log(" ", foundation.summary);
}

function main() {
  testAccessMatrixShape();
  testPolicyReviewSummary();
  testManifestVersion();
  testResourceRoleCoverage();
  testReadonlyAccessExplanation();
  console.log("\nAll access control checks passed.");
}

main();
