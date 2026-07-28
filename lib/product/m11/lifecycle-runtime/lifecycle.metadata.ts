/**
 * Product M11 — Knowledge Lifecycle Runtime version metadata
 */

import {
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type KnowledgeLifecycleMetadataRecord = {
  lifecycleRuntimeId: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_ID;
  version: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_LIFECYCLE_BASE;
  module: "M11-P7";
  domain: "Knowledge Platform";
  layer: "lifecycle-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_LIFECYCLE_METADATA: KnowledgeLifecycleMetadataRecord =
  {
    lifecycleRuntimeId: PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
    version: PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
    module: "M11-P7",
    domain: "Knowledge Platform",
    layer: "lifecycle-runtime",
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

export function getKnowledgeLifecycleMetadata(): KnowledgeLifecycleMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_LIFECYCLE_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_LIFECYCLE_METADATA.excludes],
  };
}

export function isKnowledgeLifecycleMetadataIntact(
  metadata: KnowledgeLifecycleMetadataRecord = PRODUCT_KNOWLEDGE_LIFECYCLE_METADATA,
): boolean {
  return (
    metadata.lifecycleRuntimeId ===
      "enterprise-product-knowledge-lifecycle-v1" &&
    metadata.version === "product-knowledge-lifecycle-1" &&
    metadata.freezeVersion === "product-knowledge-lifecycle-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-governance-v1" &&
    metadata.module === "M11-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
