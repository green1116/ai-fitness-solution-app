/**
 * Product Marketplace Surface — Release Gate
 * MODULE: Marketplace Surface (M08-P5)
 * BASE: enterprise-product-app-registry-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_APP_REGISTRY_ID } from "../../app/management/management.constants";
import {
  assertMarketplaceSurfaceReadinessReady,
  clearMarketplaceSurfaceLayer,
  createMarketplaceSurfaceManager,
  getMarketplaceSurfaceRegistryManifest,
} from "../marketplace-surface.manager";
import {
  PRODUCT_MARKETPLACE_SURFACE_BASE,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG,
  PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION,
  PRODUCT_MARKETPLACE_SURFACE_ID,
  PRODUCT_MARKETPLACE_SURFACE_VERSION,
  SURFACE_CATALOG_KINDS,
  SURFACE_CATALOG_STATUSES,
  SURFACE_LISTING_STATUSES,
  SURFACE_MANAGER_STATUSES,
  SURFACE_PLACEMENT_KINDS,
  SURFACE_READINESS_VERDICTS,
  SURFACE_VISIBILITY_MODES,
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

export const PRODUCT_MARKETPLACE_SURFACE_SIGNOFF_VERSION =
  "product-marketplace-surface-signoff-1" as const;

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
  clearMarketplaceSurfaceLayer();
}

export function checkProductMarketplaceSurfaceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "SURFACE-CONSTANTS",
      "management",
      "Product marketplace surface version constants",
      PRODUCT_MARKETPLACE_SURFACE_ID ===
        "enterprise-product-marketplace-surface-v1" &&
        PRODUCT_MARKETPLACE_SURFACE_VERSION ===
          "product-marketplace-surface-1" &&
        PRODUCT_MARKETPLACE_SURFACE_BASE === PRODUCT_APP_REGISTRY_ID &&
        PRODUCT_MARKETPLACE_SURFACE_FREEZE_VERSION ===
          "product-marketplace-surface-freeze-1" &&
        PRODUCT_MARKETPLACE_SURFACE_FREEZE_TAG ===
          "product-marketplace-surface-freeze-1" &&
        SURFACE_CATALOG_KINDS.length === 4 &&
        SURFACE_CATALOG_STATUSES.length === 4 &&
        SURFACE_LISTING_STATUSES.length === 4 &&
        SURFACE_VISIBILITY_MODES.length === 3 &&
        SURFACE_PLACEMENT_KINDS.length === 4 &&
        SURFACE_READINESS_VERDICTS.length === 3 &&
        SURFACE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_MARKETPLACE_SURFACE_ID} base=${PRODUCT_MARKETPLACE_SURFACE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "SURFACE-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "SURFACE-UPSTREAM",
      "compatibility",
      "Depends on app registry chain",
      PRODUCT_MARKETPLACE_SURFACE_BASE ===
        "enterprise-product-app-registry-v1" &&
        PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1",
      `app=${PRODUCT_APP_REGISTRY_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createMarketplaceSurfaceManager({
      managerId: "prod-surf-gate",
    });
    mgr.initialize();
    mgr.start();

    const catalog = mgr.registerCatalog({
      id: "surf.gate.cat",
      catalogKey: "MAIN_STOREFRONT",
      name: "Main Storefront",
      kind: "STOREFRONT",
    });
    const active = mgr.updateCatalogStatus({
      catalogId: catalog.id,
      status: "ACTIVE",
    });
    const listing = mgr.registerListing({
      id: "surf.gate.list",
      catalogId: catalog.id,
      listingKey: "ACME_COACH_LISTING",
      title: "Acme Coaching",
      appKeyRef: "ACME_COACHING",
    });
    const visible = mgr.updateListingStatus({
      listingId: listing.id,
      status: "VISIBLE",
    });
    const visibility = mgr.attachVisibility({
      id: "surf.gate.vis",
      catalogId: catalog.id,
      listingId: listing.id,
      visibilityKey: "ACME_PUBLIC",
      mode: "PUBLIC",
    });
    const placement = mgr.registerPlacement({
      id: "surf.gate.place",
      catalogId: catalog.id,
      listingId: listing.id,
      placementKey: "ACME_HOME",
      kind: "HOME",
      rank: 1,
    });
    const release = mgr.createReleaseManifest({
      id: "surf.gate.rel",
      catalogId: catalog.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getMarketplaceSurfaceRegistryManifest();

    const ok =
      catalog.catalogKey === "MAIN_STOREFRONT" &&
      active.status === "ACTIVE" &&
      visible.status === "VISIBLE" &&
      listing.appKeyRef === "ACME_COACHING" &&
      visibility.mode === "PUBLIC" &&
      placement.kind === "HOME" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_MARKETPLACE_SURFACE_ID &&
      registry.base === PRODUCT_MARKETPLACE_SURFACE_BASE &&
      registry.catalogCount >= 1 &&
      registry.listingCount >= 1 &&
      registry.visibilityCount >= 1 &&
      registry.placementCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertMarketplaceSurfaceReadinessReady(readiness);
      checks.push(
        check(
          "SURFACE-STACK",
          "marketplace-surface",
          "Catalog / listing / visibility / placement / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "SURFACE-STACK",
          "marketplace-surface",
          "Catalog / listing / visibility / placement / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product marketplace surface not ready",
        ),
      );
    }

    checks.push(
      check(
        "SURFACE-SCOPE",
        "scope",
        "No app-runtime / installation / provider-SDK / business-execution",
        ok,
        "marketplace-surface-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product marketplace surface probe failed";
    checks.push(
      check(
        "SURFACE-STACK",
        "marketplace-surface",
        "Catalog / listing / visibility / placement / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "SURFACE-SCOPE",
        "scope",
        "No app-runtime / installation / provider-SDK / business-execution",
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
      `product-marketplace-surface-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductMarketplaceSurfaceReleaseGatePass(
  gate: ReleaseGateResult = checkProductMarketplaceSurfaceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product marketplace surface release gate failed: ${gate.summary}`,
    );
  }
}
