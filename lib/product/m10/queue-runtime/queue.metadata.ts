/**
 * Product M10 — AI Queue Runtime version metadata
 */

import {
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "./queue.constants";

export type AiQueueRuntimeMetadata = {
  queueRuntimeId: typeof PRODUCT_AI_QUEUE_RUNTIME_ID;
  version: typeof PRODUCT_AI_QUEUE_RUNTIME_VERSION;
  freezeVersion: typeof PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG;
  base: typeof PRODUCT_AI_QUEUE_RUNTIME_BASE;
  module: "M10-P3";
  domain: "Enterprise AI Runtime";
  layer: "queue-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_QUEUE_RUNTIME_METADATA: AiQueueRuntimeMetadata = {
  queueRuntimeId: PRODUCT_AI_QUEUE_RUNTIME_ID,
  version: PRODUCT_AI_QUEUE_RUNTIME_VERSION,
  freezeVersion: PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG,
  base: PRODUCT_AI_QUEUE_RUNTIME_BASE,
  module: "M10-P3",
  domain: "Enterprise AI Runtime",
  layer: "queue-runtime",
  declarationOnly: true,
  excludes: [
    "queue-execution",
    "scheduler-runtime",
    "provider-runtime",
    "model-execution",
    "workflow-execution",
    "retry-runtime",
  ],
};

export function getAiQueueRuntimeMetadata(): AiQueueRuntimeMetadata {
  return {
    ...PRODUCT_AI_QUEUE_RUNTIME_METADATA,
    excludes: [...PRODUCT_AI_QUEUE_RUNTIME_METADATA.excludes],
  };
}

export function isAiQueueRuntimeMetadataIntact(
  metadata: AiQueueRuntimeMetadata = PRODUCT_AI_QUEUE_RUNTIME_METADATA,
): boolean {
  return (
    metadata.queueRuntimeId === "enterprise-product-ai-queue-runtime-v1" &&
    metadata.version === "product-ai-queue-runtime-1" &&
    metadata.freezeVersion === "product-ai-queue-runtime-freeze-1" &&
    metadata.base === "enterprise-product-ai-job-runtime-v1" &&
    metadata.module === "M10-P3" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 6
  );
}
