/**
 * Product M11 — Knowledge Catalog version metadata
 */

import {
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "./catalog.constants";

export type KnowledgeCatalogMetadataRecord = {
  catalogRuntimeId: typeof PRODUCT_KNOWLEDGE_CATALOG_ID;
  version: typeof PRODUCT_KNOWLEDGE_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_CATALOG_BASE;
  module: "M11-P2";
  domain: "Knowledge Platform";
  layer: "catalog";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_CATALOG_METADATA: KnowledgeCatalogMetadataRecord =
  {
    catalogRuntimeId: PRODUCT_KNOWLEDGE_CATALOG_ID,
    version: PRODUCT_KNOWLEDGE_CATALOG_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_CATALOG_BASE,
    module: "M11-P2",
    domain: "Knowledge Platform",
    layer: "catalog",
    declarationOnly: true,
    excludes: [
      "database",
      "vector-store",
      "rag-runtime",
      "embedding",
      "external-provider",
      "model-execution",
      "network",
    ],
  };

export function getKnowledgeCatalogMetadata(): KnowledgeCatalogMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_CATALOG_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_CATALOG_METADATA.excludes],
  };
}

export function isKnowledgeCatalogMetadataIntact(
  metadata: KnowledgeCatalogMetadataRecord = PRODUCT_KNOWLEDGE_CATALOG_METADATA,
): boolean {
  return (
    metadata.catalogRuntimeId ===
      "enterprise-product-knowledge-catalog-v1" &&
    metadata.version === "product-knowledge-catalog-1" &&
    metadata.freezeVersion === "product-knowledge-catalog-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-foundation-v1" &&
    metadata.module === "M11-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
