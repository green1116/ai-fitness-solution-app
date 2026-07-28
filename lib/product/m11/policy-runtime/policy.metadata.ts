/**
 * Product M11 — Knowledge Policy Runtime version metadata
 */

import {
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "./policy.constants";

export type KnowledgePolicyMetadataRecord = {
  policyRuntimeId: typeof PRODUCT_KNOWLEDGE_POLICY_ID;
  version: typeof PRODUCT_KNOWLEDGE_POLICY_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG;
  base: typeof PRODUCT_KNOWLEDGE_POLICY_BASE;
  module: "M11-P4";
  domain: "Knowledge Platform";
  layer: "policy-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_KNOWLEDGE_POLICY_METADATA: KnowledgePolicyMetadataRecord = {
  policyRuntimeId: PRODUCT_KNOWLEDGE_POLICY_ID,
  version: PRODUCT_KNOWLEDGE_POLICY_VERSION,
  freezeVersion: PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  freezeTag: PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG,
  base: PRODUCT_KNOWLEDGE_POLICY_BASE,
  module: "M11-P4",
  domain: "Knowledge Platform",
  layer: "policy-runtime",
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

export function getKnowledgePolicyMetadata(): KnowledgePolicyMetadataRecord {
  return {
    ...PRODUCT_KNOWLEDGE_POLICY_METADATA,
    excludes: [...PRODUCT_KNOWLEDGE_POLICY_METADATA.excludes],
  };
}

export function isKnowledgePolicyMetadataIntact(
  metadata: KnowledgePolicyMetadataRecord = PRODUCT_KNOWLEDGE_POLICY_METADATA,
): boolean {
  return (
    metadata.policyRuntimeId === "enterprise-product-knowledge-policy-v1" &&
    metadata.version === "product-knowledge-policy-1" &&
    metadata.freezeVersion === "product-knowledge-policy-freeze-1" &&
    metadata.base === "enterprise-product-knowledge-dependency-v1" &&
    metadata.module === "M11-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
