/**
 * Product M09 — AI Foundation constants
 * MODULE: AI Foundation (M09-P1)
 * BASE: enterprise-product-marketplace-baseline-v1
 * Isolated namespace: lib/product/m09
 * Declaration only — no providers / runtime / network
 */

export const PRODUCT_AI_FOUNDATION_ID =
  "enterprise-product-ai-foundation-v1" as const;

export const PRODUCT_AI_FOUNDATION_VERSION = "product-ai-1" as const;

export const PRODUCT_AI_FOUNDATION_FREEZE_VERSION =
  "product-ai-foundation-freeze-1" as const;

export const PRODUCT_AI_FOUNDATION_BASE =
  "enterprise-product-marketplace-baseline-v1" as const;

export const PRODUCT_AI_FREEZE_TAG =
  "product-ai-foundation-freeze-1" as const;

export const AI_CAPABILITY_KINDS = [
  "COMPLETION",
  "EMBEDDING",
  "CLASSIFICATION",
  "SUMMARIZATION",
  "EXTRACTION",
  "INTERNAL",
] as const;

export const AI_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const AI_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
