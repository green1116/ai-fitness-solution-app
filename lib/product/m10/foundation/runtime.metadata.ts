/**
 * Product M10 — AI Runtime Foundation version metadata
 */

import {
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
  PRODUCT_AI_RUNTIME_FREEZE_TAG,
} from "./runtime.constants";

export type AiRuntimeFoundationMetadata = {
  foundationId: typeof PRODUCT_AI_RUNTIME_FOUNDATION_ID;
  version: typeof PRODUCT_AI_RUNTIME_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_RUNTIME_FREEZE_TAG;
  base: typeof PRODUCT_AI_RUNTIME_FOUNDATION_BASE;
  module: "M10-P1";
  domain: "Enterprise AI Runtime";
  layer: "foundation";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_RUNTIME_FOUNDATION_METADATA: AiRuntimeFoundationMetadata =
  {
    foundationId: PRODUCT_AI_RUNTIME_FOUNDATION_ID,
    version: PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
    freezeTag: PRODUCT_AI_RUNTIME_FREEZE_TAG,
    base: PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
    module: "M10-P1",
    domain: "Enterprise AI Runtime",
    layer: "foundation",
    declarationOnly: true,
    excludes: [
      "job-runtime",
      "queue-runtime",
      "scheduler",
      "resource-manager",
      "provider-runtime",
      "model-execution",
      "workflow-execution",
      "agent-runtime",
      "business-logic",
    ],
  };

export function getAiRuntimeFoundationMetadata(): AiRuntimeFoundationMetadata {
  return {
    ...PRODUCT_AI_RUNTIME_FOUNDATION_METADATA,
    excludes: [...PRODUCT_AI_RUNTIME_FOUNDATION_METADATA.excludes],
  };
}

export function isAiRuntimeFoundationMetadataIntact(
  metadata: AiRuntimeFoundationMetadata = PRODUCT_AI_RUNTIME_FOUNDATION_METADATA,
): boolean {
  return (
    metadata.foundationId ===
      "enterprise-product-ai-runtime-foundation-v1" &&
    metadata.version === "product-ai-runtime-1" &&
    metadata.freezeVersion === "product-ai-runtime-foundation-freeze-1" &&
    metadata.base === "enterprise-product-ai-baseline-v1" &&
    metadata.module === "M10-P1" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 9
  );
}
