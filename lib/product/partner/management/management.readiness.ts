/**
 * Product Partner — readiness
 */

import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import { PRODUCT_CONNECTOR_FRAMEWORK_ID } from "../../connector/management/management.constants";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../../marketplace/management/management.constants";
import { listPartnerAccesses } from "../access/access.registry";
import { listPartnerAgreements } from "../agreement/agreement.registry";
import { listPartnerReleaseManifests } from "../manifest/manifest.registry";
import { listPartnerProfiles } from "../profile/profile.registry";
import { listPartners } from "../registry/partner.registry";
import { PRODUCT_PARTNER_MANAGEMENT_BASE } from "./management.constants";
import type {
  PartnerReadinessCheck,
  PartnerReadinessResult,
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
): PartnerReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePartnerManagementReadiness(): PartnerReadinessResult {
  const checks: PartnerReadinessCheck[] = [];

  checks.push(
    check(
      "PARTNER-BASE",
      "management",
      "connector framework chain aligned",
      PRODUCT_PARTNER_MANAGEMENT_BASE === PRODUCT_CONNECTOR_FRAMEWORK_ID &&
        PRODUCT_CONNECTOR_FRAMEWORK_ID ===
          "enterprise-product-connector-framework-v1" &&
        PRODUCT_MARKETPLACE_FOUNDATION_ID ===
          "enterprise-product-marketplace-foundation-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `base=${PRODUCT_PARTNER_MANAGEMENT_BASE}`,
    ),
  );

  const partners = listPartners();
  checks.push(
    check(
      "PARTNER-REG",
      "registry",
      "Active partners present",
      partners.some((p) => p.status === "ACTIVE"),
      `partners=${partners.length}`,
    ),
  );

  const profiles = listPartnerProfiles();
  checks.push(
    check(
      "PARTNER-PROF",
      "profile",
      "Partner profiles present",
      profiles.length >= 1,
      `profiles=${profiles.length}`,
    ),
  );

  const agreements = listPartnerAgreements();
  checks.push(
    check(
      "PARTNER-AGR",
      "agreement",
      "Active agreements present",
      agreements.some((a) => a.status === "ACTIVE"),
      `agreements=${agreements.length}`,
    ),
  );

  const accesses = listPartnerAccesses();
  checks.push(
    check(
      "PARTNER-ACC",
      "access",
      "Granted accesses present",
      accesses.some((a) => a.status === "GRANTED"),
      `accesses=${accesses.length}`,
    ),
  );

  const releases = listPartnerReleaseManifests();
  checks.push(
    check(
      "PARTNER-REL",
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
    summary: `product-partner readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPartnerManagementReadinessReady(
  result: PartnerReadinessResult,
): asserts result is PartnerReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product partner management not ready: ${result.summary}`,
    );
  }
}
