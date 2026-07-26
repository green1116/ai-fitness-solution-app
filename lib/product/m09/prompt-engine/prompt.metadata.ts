/**
 * Product M09 — AI Prompt Engine version metadata
 */

import {
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
  PRODUCT_AI_PROMPT_FREEZE_TAG,
} from "./prompt.constants";

export type AiPromptEngineMetadata = {
  engineId: typeof PRODUCT_AI_PROMPT_ENGINE_ID;
  version: typeof PRODUCT_AI_PROMPT_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_PROMPT_FREEZE_TAG;
  base: typeof PRODUCT_AI_PROMPT_ENGINE_BASE;
  module: "M09-P3";
  domain: "AI Enhancement";
  layer: "prompt-engine";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_PROMPT_ENGINE_METADATA: AiPromptEngineMetadata = {
  engineId: PRODUCT_AI_PROMPT_ENGINE_ID,
  version: PRODUCT_AI_PROMPT_ENGINE_VERSION,
  freezeVersion: PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_PROMPT_FREEZE_TAG,
  base: PRODUCT_AI_PROMPT_ENGINE_BASE,
  module: "M09-P3",
  domain: "AI Enhancement",
  layer: "prompt-engine",
  declarationOnly: true,
  excludes: [
    "provider-runtime",
    "model-execution",
    "workflow",
    "agent",
    "tool-calling",
  ],
};

export function getAiPromptEngineMetadata(): AiPromptEngineMetadata {
  return {
    ...PRODUCT_AI_PROMPT_ENGINE_METADATA,
    excludes: [...PRODUCT_AI_PROMPT_ENGINE_METADATA.excludes],
  };
}

export function isAiPromptEngineMetadataIntact(
  metadata: AiPromptEngineMetadata = PRODUCT_AI_PROMPT_ENGINE_METADATA,
): boolean {
  return (
    metadata.engineId === "enterprise-product-ai-prompt-engine-v1" &&
    metadata.version === "product-ai-prompt-1" &&
    metadata.freezeVersion === "product-ai-prompt-engine-freeze-1" &&
    metadata.base === "enterprise-product-ai-model-registry-v1" &&
    metadata.module === "M09-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 5
  );
}
