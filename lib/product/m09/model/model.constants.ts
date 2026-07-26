/**
 * Product M09 — AI Model Registry constants
 * MODULE: Model Registry (M09-P2)
 * BASE: enterprise-product-ai-foundation-v1
 * Isolated namespace: lib/product/m09/model
 * Declaration only — no provider runtime / prompt / agent
 */

export const PRODUCT_AI_MODEL_REGISTRY_ID =
  "enterprise-product-ai-model-registry-v1" as const;

export const PRODUCT_AI_MODEL_REGISTRY_VERSION =
  "product-ai-model-1" as const;

export const PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION =
  "product-ai-model-registry-freeze-1" as const;

export const PRODUCT_AI_MODEL_REGISTRY_BASE =
  "enterprise-product-ai-foundation-v1" as const;

export const PRODUCT_AI_MODEL_FREEZE_TAG =
  "product-ai-model-registry-freeze-1" as const;

export const AI_MODEL_FAMILIES = [
  "GENERAL",
  "EMBEDDING",
  "VISION",
  "CODE",
  "INTERNAL",
] as const;

export const AI_MODEL_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_MODEL_VERSION_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_MODEL_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_MODEL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
