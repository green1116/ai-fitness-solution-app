/**
 * Product Iteration — Commercial Product Iteration Foundation constants
 * BASE: enterprise-product-complete-v1
 * Isolated namespace: lib/product/iteration
 */

export const PRODUCT_ITERATION_FOUNDATION_ID =
  "enterprise-product-iteration-foundation-v1" as const;

export const PRODUCT_ITERATION_FOUNDATION_VERSION =
  "product-iteration-1" as const;

export const PRODUCT_ITERATION_FOUNDATION_FREEZE_VERSION =
  "product-iteration-foundation-freeze-1" as const;

export const PRODUCT_ITERATION_FOUNDATION_BASE =
  "enterprise-product-complete-v1" as const;

export const PRODUCT_ITERATION_FREEZE_VERSION =
  "product-iteration-foundation-freeze-1" as const;

export const CYCLE_STATUSES = [
  "PLANNED",
  "ACTIVE",
  "REVIEW",
  "SHIPPED",
  "ARCHIVED",
] as const;

export const BACKLOG_PRIORITIES = [
  "P0",
  "P1",
  "P2",
  "P3",
] as const;

export const EXPERIMENT_STATUSES = [
  "HYPOTHESIS",
  "RUNNING",
  "CONCLUDED",
  "ABANDONED",
] as const;

export const ROADMAP_HORIZONS = [
  "NOW",
  "NEXT",
  "LATER",
] as const;

export const IMPACT_BANDS = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;

export const CADENCE_KINDS = [
  "WEEKLY",
  "BIWEEKLY",
  "MONTHLY",
  "QUARTERLY",
] as const;

export const ITERATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ITERATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
