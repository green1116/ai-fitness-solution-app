/**
 * Product M14 — Intelligence Compatibility Runtime version metadata
 */

import {
  PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
  PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "./compatibility.constants";

export type IntelligenceCompatibilityMetadataRecord = {
  compatibilityRuntimeId: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_ID;
  version: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE;
  module: "M14-P5";
  domain: "Enterprise Intelligence";
  layer: "compatibility-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_COMPATIBILITY_METADATA: IntelligenceCompatibilityMetadataRecord =
  {
    compatibilityRuntimeId: PRODUCT_INTELLIGENCE_COMPATIBILITY_ID,
    version: PRODUCT_INTELLIGENCE_COMPATIBILITY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_COMPATIBILITY_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_COMPATIBILITY_BASE,
    module: "M14-P5",
    domain: "Enterprise Intelligence",
    layer: "compatibility-runtime",
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

export function getIntelligenceCompatibilityMetadata(): IntelligenceCompatibilityMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_COMPATIBILITY_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_COMPATIBILITY_METADATA.excludes],
  };
}

export function isIntelligenceCompatibilityMetadataIntact(
  metadata: IntelligenceCompatibilityMetadataRecord = PRODUCT_INTELLIGENCE_COMPATIBILITY_METADATA,
): boolean {
  return (
    metadata.compatibilityRuntimeId ===
      "enterprise-product-intelligence-compatibility-v1" &&
    metadata.version === "product-intelligence-compatibility-1" &&
    metadata.freezeVersion ===
      "product-intelligence-compatibility-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-policy-v1" &&
    metadata.module === "M14-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
