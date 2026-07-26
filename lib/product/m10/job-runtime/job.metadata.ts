/**
 * Product M10 — AI Job Runtime version metadata
 */

import {
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "./job.constants";

export type AiJobRuntimeMetadata = {
  jobRuntimeId: typeof PRODUCT_AI_JOB_RUNTIME_ID;
  version: typeof PRODUCT_AI_JOB_RUNTIME_VERSION;
  freezeVersion: typeof PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION;
  freezeTag: typeof PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG;
  base: typeof PRODUCT_AI_JOB_RUNTIME_BASE;
  module: "M10-P2";
  domain: "Enterprise AI Runtime";
  layer: "job-runtime";
  declarationOnly: true;
  excludes: readonly string[];
};

export const PRODUCT_AI_JOB_RUNTIME_METADATA: AiJobRuntimeMetadata = {
  jobRuntimeId: PRODUCT_AI_JOB_RUNTIME_ID,
  version: PRODUCT_AI_JOB_RUNTIME_VERSION,
  freezeVersion: PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  freezeTag: PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG,
  base: PRODUCT_AI_JOB_RUNTIME_BASE,
  module: "M10-P2",
  domain: "Enterprise AI Runtime",
  layer: "job-runtime",
  declarationOnly: true,
  excludes: [
    "job-execution",
    "queue-runtime",
    "scheduler",
    "provider-runtime",
    "model-execution",
    "workflow-execution",
    "retry-logic",
  ],
};

export function getAiJobRuntimeMetadata(): AiJobRuntimeMetadata {
  return {
    ...PRODUCT_AI_JOB_RUNTIME_METADATA,
    excludes: [...PRODUCT_AI_JOB_RUNTIME_METADATA.excludes],
  };
}

export function isAiJobRuntimeMetadataIntact(
  metadata: AiJobRuntimeMetadata = PRODUCT_AI_JOB_RUNTIME_METADATA,
): boolean {
  return (
    metadata.jobRuntimeId === "enterprise-product-ai-job-runtime-v1" &&
    metadata.version === "product-ai-job-runtime-1" &&
    metadata.freezeVersion === "product-ai-job-runtime-freeze-1" &&
    metadata.base === "enterprise-product-ai-runtime-foundation-v1" &&
    metadata.module === "M10-P2" &&
    metadata.declarationOnly === true &&
    metadata.excludes.length === 7
  );
}
