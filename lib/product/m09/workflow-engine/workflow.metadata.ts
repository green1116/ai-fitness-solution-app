/**
 * Product M09 — AI Workflow Engine version metadata
 */

import {
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
  PRODUCT_AI_WORKFLOW_FREEZE_TAG,
} from "./workflow.constants";

export type AiWorkflowEngineMetadata = {
  engineId: typeof PRODUCT_AI_WORKFLOW_ENGINE_ID;
  version: typeof PRODUCT_AI_WORKFLOW_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_WORKFLOW_FREEZE_TAG;
  base: typeof PRODUCT_AI_WORKFLOW_ENGINE_BASE;
  module: "M09-P4";
  domain: "AI Enhancement";
  layer: "workflow-engine";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_WORKFLOW_ENGINE_METADATA: AiWorkflowEngineMetadata = {
  engineId: PRODUCT_AI_WORKFLOW_ENGINE_ID,
  version: PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
  freezeVersion: PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_WORKFLOW_FREEZE_TAG,
  base: PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  module: "M09-P4",
  domain: "AI Enhancement",
  layer: "workflow-engine",
  declarationOnly: true,
  excludes: [
    "provider-runtime",
    "model-execution",
    "agent",
    "tool-calling",
    "orchestration-runtime",
  ],
};

export function getAiWorkflowEngineMetadata(): AiWorkflowEngineMetadata {
  return {
    ...PRODUCT_AI_WORKFLOW_ENGINE_METADATA,
    excludes: [...PRODUCT_AI_WORKFLOW_ENGINE_METADATA.excludes],
  };
}

export function isAiWorkflowEngineMetadataIntact(
  metadata: AiWorkflowEngineMetadata = PRODUCT_AI_WORKFLOW_ENGINE_METADATA,
): boolean {
  return (
    metadata.engineId === "enterprise-product-ai-workflow-engine-v1" &&
    metadata.version === "product-ai-workflow-1" &&
    metadata.freezeVersion === "product-ai-workflow-engine-freeze-1" &&
    metadata.base === "enterprise-product-ai-prompt-engine-v1" &&
    metadata.module === "M09-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 5
  );
}
