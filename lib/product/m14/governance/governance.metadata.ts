/**
 * Product M14 — Intelligence Governance version metadata
 */

import {
  PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
  PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
} from "./governance.constants";

export type IntelligenceGovernanceMetadataRecord = {
  governanceRuntimeId: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_ID;
  version: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_INTELLIGENCE_GOVERNANCE_BASE;
  module: "M14-P6";
  domain: "Enterprise Intelligence";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_INTELLIGENCE_GOVERNANCE_METADATA: IntelligenceGovernanceMetadataRecord =
  {
    governanceRuntimeId: PRODUCT_INTELLIGENCE_GOVERNANCE_ID,
    version: PRODUCT_INTELLIGENCE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_VERSION,
    freezeTag: PRODUCT_INTELLIGENCE_GOVERNANCE_FREEZE_TAG,
    base: PRODUCT_INTELLIGENCE_GOVERNANCE_BASE,
    module: "M14-P6",
    domain: "Enterprise Intelligence",
    layer: "governance",
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

export function getIntelligenceGovernanceMetadata(): IntelligenceGovernanceMetadataRecord {
  return {
    ...PRODUCT_INTELLIGENCE_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_INTELLIGENCE_GOVERNANCE_METADATA.excludes],
  };
}

export function isIntelligenceGovernanceMetadataIntact(
  metadata: IntelligenceGovernanceMetadataRecord = PRODUCT_INTELLIGENCE_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceRuntimeId ===
      "enterprise-product-intelligence-governance-v1" &&
    metadata.version === "product-intelligence-governance-1" &&
    metadata.freezeVersion === "product-intelligence-governance-freeze-1" &&
    metadata.base === "enterprise-product-intelligence-compatibility-v1" &&
    metadata.module === "M14-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
