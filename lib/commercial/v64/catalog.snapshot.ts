/**
 * V64 P5 — Tier catalog snapshot builder
 */
import { PRODUCT_PACKAGING_VERSION } from "@/lib/productization/catalog";

import { buildCommercialProductCatalogBundle } from "./catalog.builder";
import type { TierCatalogSnapshot } from "./catalog.types";
import { V64_CATALOG_LAYER_VERSION } from "./catalog.types";
import { V64_COMMERCIAL_FOUNDATION_VERSION } from "./types";

export function buildTierCatalogSnapshot(input?: {
  deploymentId?: string;
}): TierCatalogSnapshot {
  const deploymentId = input?.deploymentId ?? "v64-catalog-layer-default";
  const bundle = buildCommercialProductCatalogBundle({ deploymentId });

  return {
    version: V64_CATALOG_LAYER_VERSION,
    snapshotId: `tier-catalog-snapshot-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    bundle,
    foundationVersion: V64_COMMERCIAL_FOUNDATION_VERSION,
    packagingVersion: PRODUCT_PACKAGING_VERSION,
    summary: [
      `tier-catalog-snapshot tiers=${bundle.tierEntries.length}`,
      `packaging=${PRODUCT_PACKAGING_VERSION}`,
    ].join(" "),
  };
}
