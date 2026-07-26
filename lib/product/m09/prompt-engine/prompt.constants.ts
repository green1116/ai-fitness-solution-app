/**
 * Product M09 — AI Prompt Engine constants
 * MODULE: Prompt Engine (M09-P3)
 * BASE: enterprise-product-ai-model-registry-v1
 * Isolated namespace: lib/product/m09/prompt-engine
 * Declaration only — no provider runtime / model execution / agent
 */

export const PRODUCT_AI_PROMPT_ENGINE_ID =
  "enterprise-product-ai-prompt-engine-v1" as const;

export const PRODUCT_AI_PROMPT_ENGINE_VERSION =
  "product-ai-prompt-1" as const;

export const PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION =
  "product-ai-prompt-engine-freeze-1" as const;

export const PRODUCT_AI_PROMPT_ENGINE_BASE =
  "enterprise-product-ai-model-registry-v1" as const;

export const PRODUCT_AI_PROMPT_FREEZE_TAG =
  "product-ai-prompt-engine-freeze-1" as const;

export const AI_PROMPT_KINDS = [
  "SYSTEM",
  "USER",
  "ASSISTANT",
  "TEMPLATE",
  "INTERNAL",
] as const;

export const AI_PROMPT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_PROMPT_VERSION_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_PROMPT_BINDING_STATUSES = [
  "BOUND",
  "UNBOUND",
  "REVOKED",
] as const;

export const AI_PROMPT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
