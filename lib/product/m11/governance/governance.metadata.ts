/**
 * Product M11 — Knowledge Governance version metadata
 */

import {
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./governance.constants";

export type KnowledgeGovernanceMetadataRecord = {
  governanceRuntimeId: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_ID;
  version: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_GOVERNANCE_BASE;
  module: "M11-P6";
  domain: "Knowledge Platform";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_GOVERNANCE_METADATA: KnowledgeGovernanceMetadataRecord =
  {
    governanceRuntimeId: PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
    version: PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
    freezeTag: PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG,
    base: PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
    module: "M11-P6",
    domain: "Knowledge Platform",
    layer: "governance",
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

export function getKnowledgeGovernanceMetadata(): KnowledgeGovernanceMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_GOVERNANCE_METADATA.excludes],
  };
}

export function isKnowledgeGovernanceMetadataIntact(
  metadata: KnowledgeGovernanceMetadataRecord = PRODUCT_KNOWLEDGE_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceRuntimeId ===
      "enterprise-product-knowledge-governance-v1" &&
    metadata.version === "product-knowledge-governance-1" &&
    metadata.freezeVersion === "product-knowledge-governance-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-compatibility-v1" &&
    metadata.module === "M11-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
