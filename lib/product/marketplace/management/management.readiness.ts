/**
 * Product Marketplace — readiness
 */

import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import { listMarketplaceDefinitions } from "../definition/definition.registry";
import { listMarketplaceLifecycles } from "../lifecycle/lifecycle.registry";
import { listMarketplaceReleaseManifests } from "../manifest/manifest.registry";
import { listMarketplacePolicies } from "../policy/policy.registry";
import { listMarketplaceListings } from "../registry/listing.registry";
import { listMarketplaceVersions } from "../version/version.registry";
import { PRODUCT_MARKETPLACE_FOUNDATION_BASE } from "./management.constants";
import type {
  MarketplaceReadinessCheck,
  MarketplaceReadinessResult,
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
): MarketplaceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateMarketplaceFoundationReadiness(): MarketplaceReadinessResult {
  const checks: MarketplaceReadinessCheck[] = [];

  checks.push(
    check(
      "MKT-BASE",
      "management",
      "API baseline aligned",
      PRODUCT_MARKETPLACE_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_API_BASELINE_ID &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `base=${PRODUCT_MARKETPLACE_FOUNDATION_BASE}`,
    ),
  );

  const listings = listMarketplaceListings();
  checks.push(
    check(
      "MKT-REG",
      "registry",
      "Listings registered",
      listings.length >= 1,
      `listings=${listings.length}`,
    ),
  );

  const definitions = listMarketplaceDefinitions();
  checks.push(
    check(
      "MKT-DEF",
      "definition",
      "Definitions present",
      definitions.length >= 1,
      `definitions=${definitions.length}`,
    ),
  );

  const versions = listMarketplaceVersions();
  checks.push(
    check(
      "MKT-VER",
      "version",
      "Versions present",
      versions.length >= 1,
      `versions=${versions.length}`,
    ),
  );

  const lifecycles = listMarketplaceLifecycles();
  checks.push(
    check(
      "MKT-LC",
      "lifecycle",
      "Published lifecycles present",
      lifecycles.some((l) => l.state === "PUBLISHED"),
      `lifecycles=${lifecycles.length}`,
    ),
  );

  const policies = listMarketplacePolicies();
  checks.push(
    check(
      "MKT-POL",
      "policy",
      "Policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const releases = listMarketplaceReleaseManifests();
  checks.push(
    check(
      "MKT-REL",
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
    summary: `product-marketplace readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertMarketplaceFoundationReadinessReady(
  result: MarketplaceReadinessResult,
): asserts result is MarketplaceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product marketplace foundation not ready: ${result.summary}`,
    );
  }
}
