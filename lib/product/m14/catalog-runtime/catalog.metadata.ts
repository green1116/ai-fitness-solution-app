/**
 * Product M14 — Intelligence Catalog version metadata
 */

import {
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "./catalog.constants";

export type IntelligenceCatalogMetadataRecord = {
  catalogRuntimeId: typeof PRODUCT_INTELLIGENCE_CATALOG_ID;
  version: typeof PRODUCT_INTELLIGENCE_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_CATALOG_BASE;
  module: "M14-P2";
  domain: "Enterprise Intelligence";
  layer: "catalog";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_CATALOG_METADATA: IntelligenceCatalogMetadataRecord =
  {
    catalogRuntimeId: PRODUCT_INTELLIGENCE_CATALOG_ID,
    version: PRODUCT_INTELLIGENCE_CATALOG_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_CATALOG_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_CATALOG_BASE,
    module: "M14-P2",
    domain: "Enterprise Intelligence",
    layer: "catalog",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "intelligence-execution",
      "tool-runtime",
    ],
  };

export function getIntelligenceCatalogMetadata(): IntelligenceCatalogMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_CATALOG_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_CATALOG_METADATA.excludes],
  };
}

export function isIntelligenceCatalogMetadataIntact(
  metadata: IntelligenceCatalogMetadataRecord = PRODUCT_INTELLIGENCE_CATALOG_METADATA,
): boolean {
  return (
    metadata.catalogRuntimeId === "enterprise-product-intelligence-catalog-v1" &&
    metadata.version === "product-intelligence-catalog-1" &&
    metadata.freezeVersion === "product-intelligence-catalog-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-foundation-v1" &&
    metadata.module === "M14-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
