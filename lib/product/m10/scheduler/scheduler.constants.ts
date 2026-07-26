/**
 * Product M10 — AI Scheduler constants
 * MODULE: Scheduler (M10-P4)
 * BASE: enterprise-product-ai-queue-runtime-v1
 * Isolated namespace: lib/product/m10/scheduler
 * Definition only — no scheduler runtime / timer / cron / dispatch
 */

export const PRODUCT_AI_SCHEDULER_ID =
  "enterprise-product-ai-scheduler-v1" as const;

export const PRODUCT_AI_SCHEDULER_VERSION =
  "product-ai-scheduler-1" as const;

export const PRODUCT_AI_SCHEDULER_FREEZE_VERSION =
  "product-ai-scheduler-freeze-1" as const;

export const PRODUCT_AI_SCHEDULER_BASE =
  "enterprise-product-ai-queue-runtime-v1" as const;

export const PRODUCT_AI_SCHEDULER_FREEZE_TAG =
  "product-ai-scheduler-freeze-1" as const;

export const AI_SCHEDULE_KINDS = [
  "CRON",
  "INTERVAL",
  "ONCE",
  "INTERNAL",
] as const;

export const AI_SCHEDULE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_SCHEDULE_TRIGGER_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_SCHEDULE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_SCHEDULE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
