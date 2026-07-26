/**
 * Product M10 — AI Scheduler version metadata
 */

import {
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_TAG,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "./scheduler.constants";

export type AiSchedulerMetadata = {
  schedulerId: typeof PRODUCT_AI_SCHEDULER_ID;
  version: typeof PRODUCT_AI_SCHEDULER_VERSION;
  freezeVersion: typeof PRODUCT_AI_SCHEDULER_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_SCHEDULER_FREEZE_TAG;
  base: typeof PRODUCT_AI_SCHEDULER_BASE;
  module: "M10-P4";
  domain: "Enterprise AI Runtime";
  layer: "scheduler";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_SCHEDULER_METADATA: AiSchedulerMetadata = {
  schedulerId: PRODUCT_AI_SCHEDULER_ID,
  version: PRODUCT_AI_SCHEDULER_VERSION,
  freezeVersion: PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_SCHEDULER_FREEZE_TAG,
  base: PRODUCT_AI_SCHEDULER_BASE,
  module: "M10-P4",
  domain: "Enterprise AI Runtime",
  layer: "scheduler",
  declarationOnly: true,
  excludes: [
    "scheduler-runtime",
    "timer-execution",
    "cron-execution",
    "queue-dispatch",
    "provider-runtime",
    "model-execution",
    "workflow-execution",
    "retry-runtime",
  ],
};

export function getAiSchedulerMetadata(): AiSchedulerMetadata {
  return {
    ...PRODUCT_AI_SCHEDULER_METADATA,
    excludes: [...PRODUCT_AI_SCHEDULER_METADATA.excludes],
  };
}

export function isAiSchedulerMetadataIntact(
  metadata: AiSchedulerMetadata = PRODUCT_AI_SCHEDULER_METADATA,
): boolean {
  return (
    metadata.schedulerId === "enterprise-product-ai-scheduler-v1" &&
    metadata.version === "product-ai-scheduler-1" &&
    metadata.freezeVersion === "product-ai-scheduler-freeze-1" &&
    metadata.base === "enterprise-product-ai-queue-runtime-v1" &&
    metadata.module === "M10-P4" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 8
  );
}
