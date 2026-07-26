/**
 * Product Integration Governance — readiness
 */

import { PRODUCT_MARKETPLACE_SURFACE_ID } from "../../marketplace-surface/management/management.constants";
import { listIntegrationGovernanceCompliances } from "../compliance/compliance.registry";
import { listIntegrationGovernanceReleaseManifests } from "../manifest/manifest.registry";
import { listIntegrationGovernancePolicies } from "../policy/policy.registry";
import { listIntegrationGovernanceReviews } from "../review/review.registry";
import { listIntegrationGovernanceStandards } from "../standard/standard.registry";
import { PRODUCT_INTEGRATION_GOVERNANCE_BASE } from "./management.constants";
import type {
  IntegrationGovernanceReadinessCheck,
  IntegrationGovernanceReadinessResult,
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
): IntegrationGovernanceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateIntegrationGovernanceReadiness(): IntegrationGovernanceReadinessResult {
  const checks: IntegrationGovernanceReadinessCheck[] = [];

  checks.push(
    check(
      "IGOV-BASE",
      "management",
      "marketplace surface base aligned",
      PRODUCT_INTEGRATION_GOVERNANCE_BASE === PRODUCT_MARKETPLACE_SURFACE_ID &&
        PRODUCT_MARKETPLACE_SURFACE_ID ===
          "enterprise-product-marketplace-surface-v1",
      `base=${PRODUCT_INTEGRATION_GOVERNANCE_BASE}`,
    ),
  );

  const policies = listIntegrationGovernancePolicies();
  checks.push(
    check(
      "IGOV-POL",
      "policy",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  const standards = listIntegrationGovernanceStandards();
  checks.push(
    check(
      "IGOV-STD",
      "standard",
      "Governance standards present",
      standards.length >= 1,
      `standards=${standards.length}`,
    ),
  );

  const reviews = listIntegrationGovernanceReviews();
  checks.push(
    check(
      "IGOV-REV",
      "review",
      "Approved reviews present",
      reviews.some((r) => r.verdict === "APPROVED"),
      `reviews=${reviews.length}`,
    ),
  );

  const compliances = listIntegrationGovernanceCompliances();
  checks.push(
    check(
      "IGOV-CMP",
      "compliance",
      "Compliant assessments present",
      compliances.some((c) => c.verdict === "COMPLIANT"),
      `compliances=${compliances.length}`,
    ),
  );

  const releases = listIntegrationGovernanceReleaseManifests();
  checks.push(
    check(
      "IGOV-REL",
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
    summary: `product-integration-governance readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertIntegrationGovernanceReadinessReady(
  result: IntegrationGovernanceReadinessResult,
): asserts result is IntegrationGovernanceReadinessResult & {
  verdict: "READY";
} {
  if (result.verdict !== "READY") {
    throw new Error(
      `product integration governance not ready: ${result.summary}`,
    );
  }
}
