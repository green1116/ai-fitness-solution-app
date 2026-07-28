/**
 * Product M11 — Knowledge Compatibility Runtime version metadata
 */

import {
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type KnowledgeCompatibilityMetadataRecord = {
  compatibilityRuntimeId: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_ID;
  version: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE;
  module: "M11-P5";
  domain: "Knowledge Platform";
  layer: "compatibility-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_COMPATIBILITY_METADATA: KnowledgeCompatibilityMetadataRecord =
  {
    compatibilityRuntimeId: PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
    version: PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
    module: "M11-P5",
    domain: "Knowledge Platform",
    layer: "compatibility-runtime",
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

export function getKnowledgeCompatibilityMetadata(): KnowledgeCompatibilityMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_COMPATIBILITY_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_COMPATIBILITY_METADATA.excludes],
  };
}

export function isKnowledgeCompatibilityMetadataIntact(
  metadata: KnowledgeCompatibilityMetadataRecord = PRODUCT_KNOWLEDGE_COMPATIBILITY_METADATA,
): boolean {
  return (
    metadata.compatibilityRuntimeId ===
      "enterprise-product-knowledge-compatibility-v1" &&
    metadata.version === "product-knowledge-compatibility-1" &&
    metadata.freezeVersion ===
      "product-knowledge-compatibility-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-policy-v1" &&
    metadata.module === "M11-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
