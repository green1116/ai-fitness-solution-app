/**
 * Product M10 — AI Runtime Governance version metadata
 */

import {
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "./governance.constants";

export type AiRuntimeGovernanceMetadataRecord = {
  governanceId: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_ID;
  version: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG;
  base: typeof PRODUCT_AI_RUNTIME_GOVERNANCE_BASE;
  module: "M10-P6";
  domain: "Enterprise AI Runtime";
  layer: "runtime-governance";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_RUNTIME_GOVERNANCE_METADATA: AiRuntimeGovernanceMetadataRecord =
  {
    governanceId: PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
    version: PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
    freezeTag: PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG,
    base: PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
    module: "M10-P6",
    domain: "Enterprise AI Runtime",
    layer: "runtime-governance",
    declarationOnly: true,
    excludes: [
      "allocation-runtime",
      "token-accounting",
      "autoscaling",
      "provider-runtime",
      "model-execution",
      "queue-execution",
      "scheduler-execution",
      "monitoring-implementation",
    ],
  };

export function getAiRuntimeGovernanceMetadata(): AiRuntimeGovernanceMetadataRecord {
  return {
    ...PRODUCT_AI_RUNTIME_GOVERNANCE_METADATA,
    excludes: [...PRODUCT_AI_RUNTIME_GOVERNANCE_METADATA.excludes],
  };
}

export function isAiRuntimeGovernanceMetadataIntact(
  metadata: AiRuntimeGovernanceMetadataRecord = PRODUCT_AI_RUNTIME_GOVERNANCE_METADATA,
): boolean {
  return (
    metadata.governanceId ===
      "enterprise-product-ai-runtime-governance-v1" &&
    metadata.version === "product-ai-runtime-governance-1" &&
    metadata.freezeVersion === "product-ai-runtime-governance-freeze-1" &&
    metadata.base === "enterprise-product-ai-resource-manager-v1" &&
    metadata.module === "M10-P6" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}
