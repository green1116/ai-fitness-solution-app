/**
 * V3.7-H10 Access Control API & Policy Review — smoke verification
 */
import {
  PRODUCTION_ACCESS_CONTROL_VERSION,
  POLICY_REVIEW_VERSION,
  buildProductionAccessControlFoundation,
  buildPolicyReview,
  type ProductionAccessControlFoundation,
  type PolicyReview,
} from "../lib/commercialization/access";

const ACCESS_CONTROL_API_KEYS: (keyof ProductionAccessControlFoundation)[] = [
  "version",
  "foundationId",
  "dto",
  "policyReview",
  "matrix",
  "manifest",
  "summary",
];

const POLICY_REVIEW_API_KEYS: (keyof PolicyReview)[] = [
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

const ACCESS_CONTROL_PAGE_FIELDS = [
  "roles",
  "resources",
  "permissions",
  "allowRules",
  "denyRules",
  "readyForOps",
] as const;

const POLICY_REVIEW_PAGE_FIELDS = [
  "effectiveAccess",
  "roleSummary",
  "resourceSummary",
  "permissionSummary",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testAccessControlApiShape() {
  const foundation = buildProductionAccessControlFoundation({ deploymentId: "h10-access-api" });
  assert(foundation.version === PRODUCTION_ACCESS_CONTROL_VERSION, "foundation version");
  for (const key of ACCESS_CONTROL_API_KEYS) {
    assert(key in foundation, `access control API missing ${key}`);
  }
  assert(foundation.dto.roles.length === 4, "roles");
  assert(foundation.dto.resources.length >= 5, "resources");
  assert(foundation.manifest.readyForOps, "ready for ops");
  assert(foundation.matrix.grantedCount > 0, "granted count");

  console.log("✓ access control API shape");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/access-control foundationId=${foundation.foundationId}`,
  );
}

function testPolicyReviewApiShape() {
  const review = buildPolicyReview({ deploymentId: "h10-policy-api" });
  assert(review.version === POLICY_REVIEW_VERSION, "policy review version");
  for (const key of POLICY_REVIEW_API_KEYS) {
    assert(key in review, `policy review API missing ${key}`);
  }
  assert(review.effectiveAccess.length > 0, "effective access");
  assert(review.roleSummary.includes("roles="), "role summary");
  assert(review.allowSummary.includes("allowRules="), "allow summary");

  console.log("✓ policy review API shape");
  console.log(" ", `endpoint=GET /api/commercialization/policy-review reviewId=${review.reviewId}`);
}

function testAccessControlPageShape() {
  const foundation = buildProductionAccessControlFoundation({ deploymentId: "h10-access-page" });
  const pageData: Record<(typeof ACCESS_CONTROL_PAGE_FIELDS)[number], unknown> = {
    roles: foundation.dto.roles,
    resources: foundation.dto.resources,
    permissions: foundation.dto.permissions,
    allowRules: foundation.dto.allowRules,
    denyRules: foundation.dto.denyRules,
    readyForOps: foundation.manifest.readyForOps,
  };

  for (const field of ACCESS_CONTROL_PAGE_FIELDS) {
    assert(field in pageData, `access control page missing ${field}`);
    const value = pageData[field];
    if (field === "readyForOps") {
      assert(value === true, "ready for ops");
    } else if (Array.isArray(value)) {
      assert(field === "denyRules" || value.length > 0, `page field empty array: ${field}`);
    } else {
      assert(value !== undefined, `page field undefined: ${field}`);
    }
  }

  console.log("✓ access control page shape");
  console.log(
    " ",
    `route=/dashboard/access-control readyForOps=${foundation.manifest.readyForOps} roles=${foundation.dto.roles.length}`,
  );
}

function testPolicyReviewPageShape() {
  const review = buildPolicyReview({ deploymentId: "h10-policy-page" });
  const pageData: Record<(typeof POLICY_REVIEW_PAGE_FIELDS)[number], unknown> = {
    effectiveAccess: review.effectiveAccess,
    roleSummary: review.roleSummary,
    resourceSummary: review.resourceSummary,
    permissionSummary: review.permissionSummary,
  };

  for (const field of POLICY_REVIEW_PAGE_FIELDS) {
    assert(field in pageData, `policy review page missing ${field}`);
    const value = pageData[field];
    if (Array.isArray(value)) {
      assert(value.length > 0, `page field empty array: ${field}`);
    } else {
      assert(typeof value === "string" && value.length > 0, `page field empty: ${field}`);
    }
  }

  assert(review.effectiveAccess.some((e) => e.granted && e.explanation.length > 0), "explanations");

  console.log("✓ policy review page shape");
  console.log(
    " ",
    `route=/dashboard/policy-review granted=${review.effectiveAccess.filter((e) => e.granted).length}`,
  );
}

function main() {
  testAccessControlApiShape();
  testPolicyReviewApiShape();
  testAccessControlPageShape();
  testPolicyReviewPageShape();
  console.log("\nAll access control API checks passed.");
}

main();
