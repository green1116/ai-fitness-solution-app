/**
 * Product Marketplace — Foundation Release Gate
 * MODULE: Marketplace Foundation (M08-P1)
 * BASE: enterprise-product-api-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import {
  assertMarketplaceFoundationReadinessReady,
  clearMarketplaceFoundationLayer,
  createMarketplaceManager,
  getMarketplaceRegistryManifest,
} from "../marketplace.manager";
import {
  MARKETPLACE_LIFECYCLE_STATES,
  MARKETPLACE_LISTING_KINDS,
  MARKETPLACE_MANAGER_STATUSES,
  MARKETPLACE_POLICY_MODES,
  MARKETPLACE_READINESS_VERDICTS,
  PRODUCT_MARKETPLACE_FOUNDATION_BASE,
  PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_FOUNDATION_ID,
  PRODUCT_MARKETPLACE_FOUNDATION_VERSION,
  PRODUCT_MARKETPLACE_FREEZE_VERSION,
} from "../management/management.constants";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_MARKETPLACE_SIGNOFF_VERSION =
  "product-marketplace-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearMarketplaceFoundationLayer();
}

export function checkProductMarketplaceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "MKT-CONSTANTS",
      "management",
      "Product marketplace foundation version constants",
      PRODUCT_MARKETPLACE_FOUNDATION_ID ===
        "enterprise-product-marketplace-foundation-v1" &&
        PRODUCT_MARKETPLACE_FOUNDATION_VERSION === "product-marketplace-1" &&
        PRODUCT_MARKETPLACE_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_API_BASELINE_ID &&
        PRODUCT_MARKETPLACE_FOUNDATION_FREEZE_VERSION ===
          "product-marketplace-foundation-freeze-1" &&
        PRODUCT_MARKETPLACE_FREEZE_VERSION ===
          "product-marketplace-foundation-freeze-1" &&
        MARKETPLACE_LISTING_KINDS.length === 4 &&
        MARKETPLACE_LIFECYCLE_STATES.length === 4 &&
        MARKETPLACE_POLICY_MODES.length === 3 &&
        MARKETPLACE_READINESS_VERDICTS.length === 3 &&
        MARKETPLACE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_MARKETPLACE_FOUNDATION_ID} base=${PRODUCT_MARKETPLACE_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "MKT-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "MKT-UPSTREAM",
      "compatibility",
      "Depends only on api-baseline",
      PRODUCT_MARKETPLACE_FOUNDATION_BASE ===
        "enterprise-product-api-baseline-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `base=${PRODUCT_MARKETPLACE_FOUNDATION_BASE}`,
    ),
  );

  try {
    cleanup();
    const mgr = createMarketplaceManager({ managerId: "prod-mkt-gate" });
    mgr.initialize();
    mgr.start();

    const listing = mgr.registerListing({
      id: "mkt.gate.list",
      listingKey: "FITNESS_COACH_APP",
      name: "Fitness Coach App",
      kind: "APP",
    });
    const definition = mgr.defineDefinition({
      id: "mkt.gate.def",
      listingId: listing.id,
      capabilityKey: "WORKOUT_PLAN",
      surfaceRef: "CATALOG_CARD",
      summary: "Workout plan catalog capability",
    });
    const version = mgr.registerVersion({
      id: "mkt.gate.ver",
      listingId: listing.id,
      versionTag: "v1",
      definitionIds: [definition.id],
    });
    const lifecycle = mgr.openLifecycle({
      id: "mkt.gate.lc",
      listingId: listing.id,
      versionId: version.id,
    });
    const published = mgr.transitionLifecycle({
      lifecycleId: lifecycle.id,
      state: "PUBLISHED",
    });
    const policy = mgr.attachPolicy({
      id: "mkt.gate.pol",
      listingId: listing.id,
      mode: "RESTRICTED",
      requireVersion: true,
    });
    const release = mgr.createReleaseManifest({
      id: "mkt.gate.rel",
      listingId: listing.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getMarketplaceRegistryManifest();

    const ok =
      listing.listingKey === "FITNESS_COACH_APP" &&
      definition.capabilityKey === "WORKOUT_PLAN" &&
      version.versionTag === "v1" &&
      published.state === "PUBLISHED" &&
      policy.mode === "RESTRICTED" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_MARKETPLACE_FOUNDATION_ID &&
      registry.base === PRODUCT_MARKETPLACE_FOUNDATION_BASE &&
      registry.listingCount >= 1 &&
      registry.definitionCount >= 1 &&
      registry.versionCount >= 1 &&
      registry.lifecycleCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertMarketplaceFoundationReadinessReady(readiness);
      checks.push(
        check(
          "MKT-STACK",
          "marketplace",
          "Listing / definition / version / lifecycle / policy / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "MKT-STACK",
          "marketplace",
          "Listing / definition / version / lifecycle / policy / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product marketplace foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "MKT-SCOPE",
        "scope",
        "No connector / plugin-runtime / partner / business-execution surface",
        ok,
        "marketplace-foundation-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product marketplace foundation probe failed";
    checks.push(
      check(
        "MKT-STACK",
        "marketplace",
        "Listing / definition / version / lifecycle / policy / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "MKT-SCOPE",
        "scope",
        "No connector / plugin-runtime / partner / business-execution surface",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-marketplace-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMarketplaceReleaseGatePass(
  gate: ReleaseGateResult = checkProductMarketplaceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product marketplace release gate failed: ${gate.summary}`,
    );
  }
}
