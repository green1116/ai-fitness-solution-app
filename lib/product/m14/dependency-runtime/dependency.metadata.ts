/**
 * Product M14 — Intelligence Dependency Runtime version metadata
 */

import {
  PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
  PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
} from "./dependency.constants";

export type IntelligenceDependencyMetadataRecord = {
  dependencyRuntimeId: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_ID;
  version: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_DEPENDENCY_BASE;
  module: "M14-P3";
  domain: "Enterprise Intelligence";
  layer: "dependency-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_DEPENDENCY_METADATA: IntelligenceDependencyMetadataRecord =
  {
    dependencyRuntimeId: PRODUCT_INTELLIGENCE_DEPENDENCY_ID,
    version: PRODUCT_INTELLIGENCE_DEPENDENCY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_DEPENDENCY_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_DEPENDENCY_BASE,
    module: "M14-P3",
    domain: "Enterprise Intelligence",
    layer: "dependency-runtime",
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

export function getIntelligenceDependencyMetadata(): IntelligenceDependencyMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_DEPENDENCY_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_DEPENDENCY_METADATA.excludes],
  };
}

export function isIntelligenceDependencyMetadataIntact(
  metadata: IntelligenceDependencyMetadataRecord = PRODUCT_INTELLIGENCE_DEPENDENCY_METADATA,
): boolean {
  return (
    metadata.dependencyRuntimeId ===
      "enterprise-product-intelligence-dependency-v1" &&
    metadata.version === "product-intelligence-dependency-1" &&
    metadata.freezeVersion ===
      "product-intelligence-dependency-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-catalog-v1" &&
    metadata.module === "M14-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
