/**
 * Product M10 — AI Job Runtime constants
 * MODULE: Job Runtime (M10-P2)
 * BASE: enterprise-product-ai-runtime-foundation-v1
 * Isolated namespace: lib/product/m10/job-runtime
 * Definition only — no job execution / queue / scheduler / retry
 */

export const PRODUCT_AI_JOB_RUNTIME_ID =
  "enterprise-product-ai-job-runtime-v1" as const;

export const PRODUCT_AI_JOB_RUNTIME_VERSION =
  "product-ai-job-runtime-1" as const;

export const PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION =
  "product-ai-job-runtime-freeze-1" as const;

export const PRODUCT_AI_JOB_RUNTIME_BASE =
  "enterprise-product-ai-runtime-foundation-v1" as const;

export const PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG =
  "product-ai-job-runtime-freeze-1" as const;

export const AI_JOB_KINDS = [
  "BATCH",
  "STREAM",
  "INTERACTIVE",
  "INTERNAL",
] as const;

export const AI_JOB_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_JOB_STEP_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_JOB_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_JOB_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
