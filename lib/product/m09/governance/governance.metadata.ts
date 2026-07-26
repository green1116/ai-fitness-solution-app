/**
 * Product M09 — AI Governance version metadata
 */

import {
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AiGovernanceMetadataRecord = {
  governanceId: typeof PRODUCT_AI_GOVERNANCE_ID;
  version: typeof PRODUCT_AI_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AI_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_AI_GOVERNANCE_BASE;
  module: "M09-P6";
  domain: "AI Enhancement";
  layer: "governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_GOVERNANCE_METADATA: AiGovernanceMetadataRecord = {
  governanceId: PRODUCT_AI_GOVERNANCE_ID,
  version: PRODUCT_AI_GOVERNANCE_VERSION,
  freezeVersion: PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_GOVERNANCE_FREEZE_TAG,
  base: PRODUCT_AI_GOVERNANCE_BASE,
  module: "M09-P6",
  domain: "AI Enhancement",
  layer: "governance",
  declarationOnly: true,
  excludes: [
    "provider-runtime",
    "model-execution",
    "workflow-runtime",
    "orchestration-runtime",
    "agent-runtime",
    "tool-calling-runtime",
  ],
};

export function getAiGovernanceMetadata(): AiGovernanceMetadataRecord {
  return {
    ...PRODUCT_AI_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_AI_GOVERNANCE_METADATA.excludes],
  };
}

export function isAiGovernanceMetadataIntact(
  metadata: AiGovernanceMetadataRecord = PRODUCT_AI_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceId === "enterprise-product-ai-governance-v1" &&
    metadata.version === "product-ai-governance-1" &&
    metadata.freezeVersion === "product-ai-governance-freeze-1" &&
    metadata.base === "enterprise-product-ai-orchestration-v1" &&
    metadata.module === "M09-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 6
  );
}
