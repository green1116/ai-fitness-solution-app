/**
 * V64 P5 — Unified commercial catalog export
 */
import {
  PRODUCT_PACKAGING_VERSION,
  buildProductCatalogResponse,
  validatePackaging,
} from "@/lib/productization/catalog";

import { buildCommercialProductCatalogBundle } from "./catalog.builder";
import type { CommercialCatalogExport } from "./catalog.types";
import { V64_CATALOG_LAYER_VERSION } from "./catalog.types";

export function buildUnifiedCatalogExport(input?: {
  deploymentId?: string;
}): CommercialCatalogExport {
  const deploymentId = input?.deploymentId ?? "v64-catalog-layer-default";
  const bundle = buildCommercialProductCatalogBundle({ deploymentId });
  const legacyCatalogResponse = buildProductCatalogResponse({ deploymentId });
  const packaging = validatePackaging({ deploymentId });

  return {
    version: V64_CATALOG_LAYER_VERSION,
    exportId: `catalog-export-${deploymentId}`,
    exportedAt: new Date().toISOString(),
    bundle,
    legacyCatalogResponse,
    backwardCompatible: {
      packagingVersion: PRODUCT_PACKAGING_VERSION,
      packagingValid: packaging.packagingValid,
    },
    summary: [
      `catalog-export tiers=${bundle.tierEntries.length}`,
      `legacy=${PRODUCT_PACKAGING_VERSION}`,
      `packagingValid=${packaging.packagingValid}`,
    ].join(" "),
  };
}
