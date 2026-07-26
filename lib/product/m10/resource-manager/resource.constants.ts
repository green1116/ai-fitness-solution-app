/**
 * Product M10 — AI Resource Manager constants
 * MODULE: Resource Manager (M10-P5)
 * BASE: enterprise-product-ai-scheduler-v1
 * Isolated namespace: lib/product/m10/resource-manager
 * Definition only — no allocation / token accounting / autoscaling
 */

export const PRODUCT_AI_RESOURCE_MANAGER_ID =
  "enterprise-product-ai-resource-manager-v1" as const;

export const PRODUCT_AI_RESOURCE_MANAGER_VERSION =
  "product-ai-resource-manager-1" as const;

export const PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION =
  "product-ai-resource-manager-freeze-1" as const;

export const PRODUCT_AI_RESOURCE_MANAGER_BASE =
  "enterprise-product-ai-scheduler-v1" as const;

export const PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG =
  "product-ai-resource-manager-freeze-1" as const;

export const AI_RESOURCE_KINDS = [
  "COMPUTE",
  "MEMORY",
  "TOKEN_BUDGET",
  "CONCURRENCY",
  "INTERNAL",
] as const;

export const AI_RESOURCE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_RESOURCE_QUOTA_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_RESOURCE_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_RESOURCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
