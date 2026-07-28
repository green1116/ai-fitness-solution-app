/**
 * Product M13 — OS Catalog version metadata
 */

import {
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_TAG,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "./catalog.constants";

export type OsCatalogMetadataRecord = {
  catalogRuntimeId: typeof PRODUCT_OS_CATALOG_ID;
  version: typeof PRODUCT_OS_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_OS_CATALOG_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_OS_CATALOG_FREEZE_TAG;
  base: typeof PRODUCT_OS_CATALOG_BASE;
  module: "M13-P2";
  domain: "Enterprise Operating System";
  layer: "catalog";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_OS_CATALOG_METADATA: OsCatalogMetadataRecord = {
  catalogRuntimeId: PRODUCT_OS_CATALOG_ID,
  version: PRODUCT_OS_CATALOG_VERSION,
  freezeVersion: PRODUCT_OS_CATALOG_FREEZE_VERSION,
  freezeTag: PRODUCT_OS_CATALOG_FREEZE_TAG,
  base: PRODUCT_OS_CATALOG_BASE,
  module: "M13-P2",
  domain: "Enterprise Operating System",
  layer: "catalog",
  declarationOnly: true,
  excludes: [
    "database",
    "vector-store",
    "rag-runtime",
    "embedding",
    "external-provider",
    "os-execution",
    "tool-runtime",
  ],
};

export function getOsCatalogMetadata(): OsCatalogMetadataRecord {
  return {
    ...PRODUCT_OS_CATALOG_METADATA,
    excludes: [...PRODUCT_OS_CATALOG_METADATA.excludes],
  };
}

export function isOsCatalogMetadataIntact(
  metadata: OsCatalogMetadataRecord = PRODUCT_OS_CATALOG_METADATA,
): boolean {
  return (
    metadata.catalogRuntimeId === "enterprise-product-os-catalog-v1" &&
    metadata.version === "product-os-catalog-1" &&
    metadata.freezeVersion === "product-os-catalog-freeze-1" &&
    metadata.base === "enterprise-product-os-foundation-v1" &&
    metadata.module === "M13-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
