/**
 * Product M10 — AI Runtime Foundation constants
 * MODULE: Enterprise AI Runtime Foundation (M10-P1)
 * BASE: enterprise-product-ai-baseline-v1
 * Isolated namespace: lib/product/m10/foundation
 * Foundation only — no job / queue / scheduler / provider / execution
 */

export const PRODUCT_AI_RUNTIME_FOUNDATION_ID =
  "enterprise-product-ai-runtime-foundation-v1" as const;

export const PRODUCT_AI_RUNTIME_FOUNDATION_VERSION =
  "product-ai-runtime-1" as const;

export const PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION =
  "product-ai-runtime-foundation-freeze-1" as const;

export const PRODUCT_AI_RUNTIME_FOUNDATION_BASE =
  "enterprise-product-ai-baseline-v1" as const;

export const PRODUCT_AI_RUNTIME_FREEZE_TAG =
  "product-ai-runtime-foundation-freeze-1" as const;

export const AI_RUNTIME_CAPABILITY_KINDS = [
  "PLANE",
  "SLOT",
  "BOUNDARY",
  "SURFACE",
  "INTERNAL",
] as const;

export const AI_RUNTIME_CAPABILITY_STATUSES = [
  "DRAFT",
  "DECLARED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_RUNTIME_DOMAIN_SCOPES = [
  "PLATFORM",
  "PRODUCT",
  "DOMAIN",
  "INTERNAL",
] as const;

export const AI_RUNTIME_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
