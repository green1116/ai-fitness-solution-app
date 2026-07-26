/**
 * Product API Governance — readiness
 */

import { PRODUCT_API_FOUNDATION_ID } from "../../api/management/management.constants";
import { PRODUCT_API_AUTHENTICATION_ID } from "../../api-authentication/management/management.constants";
import { PRODUCT_API_GATEWAY_ID } from "../../api-gateway/management/management.constants";
import { PRODUCT_API_PORTAL_ID } from "../../api-portal/management/management.constants";
import { PRODUCT_API_SDK_ID } from "../../api-sdk/management/management.constants";
import { ENTERPRISE_PRODUCT_AUTH_BASELINE_ID } from "../../auth/freeze/freeze.lock";
import { listGovernanceCompliances } from "../compliance/compliance.registry";
import { listApiGovernanceReleaseManifests } from "../manifest/manifest.registry";
import { listGovernancePolicies } from "../policy/policy.registry";
import { listGovernanceReviews } from "../review/review.registry";
import { listGovernanceStandards } from "../standard/standard.registry";
import { PRODUCT_API_GOVERNANCE_BASE } from "./management.constants";
import type {
  GovernanceReadinessCheck,
  GovernanceReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateApiGovernanceReadiness(): GovernanceReadinessResult {
  const checks: GovernanceReadinessCheck[] = [];

  checks.push(
    check(
      "GOV-BASE",
      "management",
      "api-portal chain aligned (sdk / gateway / authn / foundation / auth-baseline)",
      PRODUCT_API_GOVERNANCE_BASE === PRODUCT_API_PORTAL_ID &&
        PRODUCT_API_PORTAL_ID === "enterprise-product-api-portal-v1" &&
        PRODUCT_API_SDK_ID === "enterprise-product-api-sdk-v1" &&
        PRODUCT_API_GATEWAY_ID === "enterprise-product-api-gateway-v1" &&
        PRODUCT_API_AUTHENTICATION_ID ===
          "enterprise-product-api-authentication-v1" &&
        PRODUCT_API_FOUNDATION_ID ===
          "enterprise-product-api-foundation-v1" &&
        ENTERPRISE_PRODUCT_AUTH_BASELINE_ID ===
          "enterprise-product-auth-baseline-v1",
      `base=${PRODUCT_API_GOVERNANCE_BASE}`,
    ),
  );

  const policies = listGovernancePolicies();
  checks.push(
    check(
      "GOV-POL",
      "policy",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  const standards = listGovernanceStandards();
  checks.push(
    check(
      "GOV-STD",
      "standard",
      "Governance standards present",
      standards.length >= 1,
      `standards=${standards.length}`,
    ),
  );

  const reviews = listGovernanceReviews();
  checks.push(
    check(
      "GOV-REV",
      "review",
      "Approved reviews present",
      reviews.some((r) => r.verdict === "APPROVED"),
      `reviews=${reviews.length}`,
    ),
  );

  const compliances = listGovernanceCompliances();
  checks.push(
    check(
      "GOV-CMP",
      "compliance",
      "Compliant assessments present",
      compliances.some((c) => c.verdict === "COMPLIANT"),
      `compliances=${compliances.length}`,
    ),
  );

  const releases = listApiGovernanceReleaseManifests();
  checks.push(
    check(
      "GOV-REL",
      "manifest",
      "Release manifests present",
      releases.length >= 1 && releases.every((r) => r.checksum.length === 64),
      `releases=${releases.length}`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-api-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertApiGovernanceReadinessReady(
  result: GovernanceReadinessResult,
): asserts result is GovernanceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product api governance not ready: ${result.summary}`);
  }
}
