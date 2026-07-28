/**
 * Product M14 — Intelligence Policy Runtime version metadata
 */

import {
  PRODUCT_INTELLIGENCE_POLICY_BASE,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_POLICY_ID,
  PRODUCT_INTELLIGENCE_POLICY_VERSION,
} from "./policy.constants";

export type IntelligencePolicyMetadataRecord = {
  policyRuntimeId: typeof PRODUCT_INTELLIGENCE_POLICY_ID;
  version: typeof PRODUCT_INTELLIGENCE_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_POLICY_BASE;
  module: "M14-P4";
  domain: "Enterprise Intelligence";
  layer: "policy-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_POLICY_METADATA: IntelligencePolicyMetadataRecord =
  {
    policyRuntimeId: PRODUCT_INTELLIGENCE_POLICY_ID,
    version: PRODUCT_INTELLIGENCE_POLICY_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_POLICY_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_POLICY_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_POLICY_BASE,
    module: "M14-P4",
    domain: "Enterprise Intelligence",
    layer: "policy-runtime",
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

export function getIntelligencePolicyMetadata(): IntelligencePolicyMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_POLICY_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_POLICY_METADATA.excludes],
  };
}

export function isIntelligencePolicyMetadataIntact(
  metadata: IntelligencePolicyMetadataRecord = PRODUCT_INTELLIGENCE_POLICY_METADATA,
): boolean {
  return (
    metadata.policyRuntimeId === "enterprise-product-intelligence-policy-v1" &&
    metadata.version === "product-intelligence-policy-1" &&
    metadata.freezeVersion === "product-intelligence-policy-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-dependency-v1" &&
    metadata.module === "M14-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
