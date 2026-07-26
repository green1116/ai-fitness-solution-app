/**
 * Product M09 — AI Orchestration constants
 * MODULE: AI Orchestration (M09-P5)
 * BASE: enterprise-product-ai-workflow-engine-v1
 * Isolated namespace: lib/product/m09/orchestration
 * Declaration only — no provider / agent / tool / orchestration runtime
 */

export const PRODUCT_AI_ORCHESTRATION_ID =
  "enterprise-product-ai-orchestration-v1" as const;

export const PRODUCT_AI_ORCHESTRATION_VERSION =
  "product-ai-orchestration-1" as const;

export const PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION =
  "product-ai-orchestration-freeze-1" as const;

export const PRODUCT_AI_ORCHESTRATION_BASE =
  "enterprise-product-ai-workflow-engine-v1" as const;

export const PRODUCT_AI_ORCHESTRATION_FREEZE_TAG =
  "product-ai-orchestration-freeze-1" as const;

export const AI_ORCHESTRATION_KINDS = [
  "PLAN",
  "ROUTE",
  "COMPOSE",
  "INTERNAL",
] as const;

export const AI_ORCHESTRATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_ORCHESTRATION_VERSION_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_ORCHESTRATION_ROUTE_KINDS = [
  "WORKFLOW",
  "PROMPT",
  "MODEL",
  "INTERNAL",
] as const;

export const AI_ORCHESTRATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
