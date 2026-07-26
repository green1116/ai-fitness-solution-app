/**
 * Product M10 — AI Queue Runtime constants
 * MODULE: Queue Runtime (M10-P3)
 * BASE: enterprise-product-ai-job-runtime-v1
 * Isolated namespace: lib/product/m10/queue-runtime
 * Definition only — no queue execution / scheduler / retry
 */

export const PRODUCT_AI_QUEUE_RUNTIME_ID =
  "enterprise-product-ai-queue-runtime-v1" as const;

export const PRODUCT_AI_QUEUE_RUNTIME_VERSION =
  "product-ai-queue-runtime-1" as const;

export const PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION =
  "product-ai-queue-runtime-freeze-1" as const;

export const PRODUCT_AI_QUEUE_RUNTIME_BASE =
  "enterprise-product-ai-job-runtime-v1" as const;

export const PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG =
  "product-ai-queue-runtime-freeze-1" as const;

export const AI_QUEUE_KINDS = [
  "FIFO",
  "PRIORITY",
  "TOPIC",
  "INTERNAL",
] as const;

export const AI_QUEUE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_QUEUE_CHANNEL_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_QUEUE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_QUEUE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
