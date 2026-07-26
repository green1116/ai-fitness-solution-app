/**
 * Product Marketplace Surface — readiness
 */

import { PRODUCT_APP_REGISTRY_ID } from "../../app/management/management.constants";
import { listSurfaceCatalogs } from "../catalog/catalog.registry";
import { listSurfaceListings } from "../listing/listing.registry";
import { listMarketplaceSurfaceReleaseManifests } from "../manifest/manifest.registry";
import { listSurfacePlacements } from "../placement/placement.registry";
import { listSurfaceVisibilities } from "../visibility/visibility.registry";
import { PRODUCT_MARKETPLACE_SURFACE_BASE } from "./management.constants";
import type {
  SurfaceReadinessCheck,
  SurfaceReadinessResult,
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
): SurfaceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateMarketplaceSurfaceReadiness(): SurfaceReadinessResult {
  const checks: SurfaceReadinessCheck[] = [];

  checks.push(
    check(
      "SURFACE-BASE",
      "management",
      "app registry base aligned",
      PRODUCT_MARKETPLACE_SURFACE_BASE === PRODUCT_APP_REGISTRY_ID &&
        PRODUCT_APP_REGISTRY_ID === "enterprise-product-app-registry-v1",
      `base=${PRODUCT_MARKETPLACE_SURFACE_BASE}`,
    ),
  );

  const catalogs = listSurfaceCatalogs();
  checks.push(
    check(
      "SURFACE-CAT",
      "catalog",
      "Active catalogs present",
      catalogs.some((c) => c.status === "ACTIVE"),
      `catalogs=${catalogs.length}`,
    ),
  );

  const listings = listSurfaceListings();
  checks.push(
    check(
      "SURFACE-LIST",
      "listing",
      "Visible listings present",
      listings.some((l) => l.status === "VISIBLE"),
      `listings=${listings.length}`,
    ),
  );

  const visibilities = listSurfaceVisibilities();
  checks.push(
    check(
      "SURFACE-VIS",
      "visibility",
      "Visibilities present",
      visibilities.length >= 1,
      `visibilities=${visibilities.length}`,
    ),
  );

  const placements = listSurfacePlacements();
  checks.push(
    check(
      "SURFACE-PLACE",
      "placement",
      "Placements present",
      placements.length >= 1,
      `placements=${placements.length}`,
    ),
  );

  const releases = listMarketplaceSurfaceReleaseManifests();
  checks.push(
    check(
      "SURFACE-REL",
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
    summary: `product-marketplace-surface readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertMarketplaceSurfaceReadinessReady(
  result: SurfaceReadinessResult,
): asserts result is SurfaceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product marketplace surface not ready: ${result.summary}`,
    );
  }
}
