/**
 * Product M14 — Intelligence Lifecycle Runtime version metadata
 */

import {
  PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
  PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
} from "./lifecycle.constants";

export type IntelligenceLifecycleMetadataRecord = {
  lifecycleRuntimeId: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_ID;
  version: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_LIFECYCLE_BASE;
  module: "M14-P7";
  domain: "Enterprise Intelligence";
  layer: "lifecycle-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_LIFECYCLE_METADATA: IntelligenceLifecycleMetadataRecord =
  {
    lifecycleRuntimeId: PRODUCT_INTELLIGENCE_LIFECYCLE_ID,
    version: PRODUCT_INTELLIGENCE_LIFECYCLE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_LIFECYCLE_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_LIFECYCLE_BASE,
    module: "M14-P7",
    domain: "Enterprise Intelligence",
    layer: "lifecycle-runtime",
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

export function getIntelligenceLifecycleMetadata(): IntelligenceLifecycleMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_LIFECYCLE_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_LIFECYCLE_METADATA.excludes],
  };
}

export function isIntelligenceLifecycleMetadataIntact(
  metadata: IntelligenceLifecycleMetadataRecord = PRODUCT_INTELLIGENCE_LIFECYCLE_METADATA,
): boolean {
  return (
    metadata.lifecycleRuntimeId ===
      "enterprise-product-intelligence-lifecycle-v1" &&
    metadata.version === "product-intelligence-lifecycle-1" &&
    metadata.freezeVersion === "product-intelligence-lifecycle-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-governance-v1" &&
    metadata.module === "M14-P7" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
