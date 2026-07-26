/**
 * Product M09 — AI Model Registry version metadata
 */

import {
  PRODUCT_AI_MODEL_FREEZE_TAG,
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "./model.constants";

export type AiModelRegistryMetadata = {
  registryId: typeof PRODUCT_AI_MODEL_REGISTRY_ID;
  version: typeof PRODUCT_AI_MODEL_REGISTRY_VERSION;
  freezeVersion: typeof PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_MODEL_FREEZE_TAG;
  base: typeof PRODUCT_AI_MODEL_REGISTRY_BASE;
  module: "M09-P2";
  domain: "AI Enhancement";
  layer: "model-registry";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_MODEL_REGISTRY_METADATA: AiModelRegistryMetadata = {
  registryId: PRODUCT_AI_MODEL_REGISTRY_ID,
  version: PRODUCT_AI_MODEL_REGISTRY_VERSION,
  freezeVersion: PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_MODEL_FREEZE_TAG,
  base: PRODUCT_AI_MODEL_REGISTRY_BASE,
  module: "M09-P2",
  domain: "AI Enhancement",
  layer: "model-registry",
  declarationOnly: true,
  excludes: [
    "provider-runtime",
    "prompt-engine",
    "workflow",
    "agent",
    "tool-calling",
  ],
};

export function getAiModelRegistryMetadata(): AiModelRegistryMetadata {
  return {
    ...PRODUCT_AI_MODEL_REGISTRY_METADATA,
    excludes: [...PRODUCT_AI_MODEL_REGISTRY_METADATA.excludes],
  };
}

export function isAiModelRegistryMetadataIntact(
  metadata: AiModelRegistryMetadata = PRODUCT_AI_MODEL_REGISTRY_METADATA,
): boolean {
  return (
    metadata.registryId === "enterprise-product-ai-model-registry-v1" &&
    metadata.version === "product-ai-model-1" &&
    metadata.freezeVersion === "product-ai-model-registry-freeze-1" &&
    metadata.base === "enterprise-product-ai-foundation-v1" &&
    metadata.module === "M09-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 5
  );
}
