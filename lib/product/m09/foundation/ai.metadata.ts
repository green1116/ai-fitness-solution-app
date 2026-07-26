/**
 * Product M09 — AI Foundation version metadata
 */

import {
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
  PRODUCT_AI_FREEZE_TAG,
} from "./ai.constants";

export type AiFoundationMetadata = {
  foundationId: typeof PRODUCT_AI_FOUNDATION_ID;
  version: typeof PRODUCT_AI_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_FREEZE_TAG;
  base: typeof PRODUCT_AI_FOUNDATION_BASE;
  module: "M09-P1";
  domain: "AI Enhancement";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_FOUNDATION_METADATA: AiFoundationMetadata = {
  foundationId: PRODUCT_AI_FOUNDATION_ID,
  version: PRODUCT_AI_FOUNDATION_VERSION,
  freezeVersion: PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_FREEZE_TAG,
  base: PRODUCT_AI_FOUNDATION_BASE,
  module: "M09-P1",
  domain: "AI Enhancement",
  layer: "foundation",
  declarationOnly: true,
  excludes: [
    "llm-providers",
    "openai",
    "claude",
    "gemini",
    "prompt-engine",
    "workflow",
    "agent",
    "tool-calling",
    "runtime",
    "network",
    "database",
    "business-logic",
  ],
};

export function getAiFoundationMetadata(): AiFoundationMetadata {
  return {
    ...PRODUCT_AI_FOUNDATION_METADATA,
    excludes: [...PRODUCT_AI_FOUNDATION_METADATA.excludes],
  };
}

export function isAiFoundationMetadataIntact(
  metadata: AiFoundationMetadata = PRODUCT_AI_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId === "enterprise-product-ai-foundation-v1" &&
    metadata.version === "product-ai-1" &&
    metadata.freezeVersion === "product-ai-foundation-freeze-1" &&
    metadata.base === "enterprise-product-marketplace-baseline-v1" &&
    metadata.module === "M09-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 12
  );
}
