/**
 * Product M09 — AI Orchestration version metadata
 */

import {
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_TAG,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "./orchestration.constants";

export type AiOrchestrationMetadataRecord = {
  orchestrationId: typeof PRODUCT_AI_ORCHESTRATION_ID;
  version: typeof PRODUCT_AI_ORCHESTRATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_ORCHESTRATION_FREEZE_TAG;
  base: typeof PRODUCT_AI_ORCHESTRATION_BASE;
  module: "M09-P5";
  domain: "AI Enhancement";
  layer: "orchestration";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_ORCHESTRATION_METADATA: AiOrchestrationMetadataRecord =
  {
    orchestrationId: PRODUCT_AI_ORCHESTRATION_ID,
    version: PRODUCT_AI_ORCHESTRATION_VERSION,
    freezeVersion: PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
    freezeTag: PRODUCT_AI_ORCHESTRATION_FREEZE_TAG,
    base: PRODUCT_AI_ORCHESTRATION_BASE,
    module: "M09-P5",
    domain: "AI Enhancement",
    layer: "orchestration",
    declarationOnly: true,
    excludes: [
      "provider-runtime",
      "model-execution",
      "agent-runtime",
      "tool-calling-runtime",
      "business-logic",
    ],
  };

export function getAiOrchestrationMetadata(): AiOrchestrationMetadataRecord {
  return {
    ...PRODUCT_AI_ORCHESTRATION_METADATA,
    excludes: [...PRODUCT_AI_ORCHESTRATION_METADATA.excludes],
  };
}

export function isAiOrchestrationMetadataIntact(
  metadata: AiOrchestrationMetadataRecord = PRODUCT_AI_ORCHESTRATION_METADATA,
): boolean {
  return (
    metadata.orchestrationId === "enterprise-product-ai-orchestration-v1" &&
    metadata.version === "product-ai-orchestration-1" &&
    metadata.freezeVersion === "product-ai-orchestration-freeze-1" &&
    metadata.base === "enterprise-product-ai-workflow-engine-v1" &&
    metadata.module === "M09-P5" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 5
  );
}
