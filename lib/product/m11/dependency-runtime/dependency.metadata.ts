/**
 * Product M11 — Knowledge Dependency Runtime version metadata
 */

import {
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type KnowledgeDependencyMetadataRecord = {
  dependencyRuntimeId: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_ID;
  version: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_DEPENDENCY_BASE;
  module: "M11-P3";
  domain: "Knowledge Platform";
  layer: "dependency-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_DEPENDENCY_METADATA: KnowledgeDependencyMetadataRecord =
  {
    dependencyRuntimeId: PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
    version: PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
    module: "M11-P3",
    domain: "Knowledge Platform",
    layer: "dependency-runtime",
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

export function getKnowledgeDependencyMetadata(): KnowledgeDependencyMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_DEPENDENCY_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_DEPENDENCY_METADATA.excludes],
  };
}

export function isKnowledgeDependencyMetadataIntact(
  metadata: KnowledgeDependencyMetadataRecord = PRODUCT_KNOWLEDGE_DEPENDENCY_METADATA,
): boolean {
  return (
    metadata.dependencyRuntimeId ===
      "enterprise-product-knowledge-dependency-v1" &&
    metadata.version === "product-knowledge-dependency-1" &&
    metadata.freezeVersion === "product-knowledge-dependency-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-catalog-v1" &&
    metadata.module === "M11-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
