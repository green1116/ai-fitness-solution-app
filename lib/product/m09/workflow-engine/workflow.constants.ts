/**
 * Product M09 — AI Workflow Engine constants
 * MODULE: Workflow Engine (M09-P4)
 * BASE: enterprise-product-ai-prompt-engine-v1
 * Isolated namespace: lib/product/m09/workflow-engine
 * Declaration only — no orchestration runtime / agent / tool calling
 */

export const PRODUCT_AI_WORKFLOW_ENGINE_ID =
  "enterprise-product-ai-workflow-engine-v1" as const;

export const PRODUCT_AI_WORKFLOW_ENGINE_VERSION =
  "product-ai-workflow-1" as const;

export const PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION =
  "product-ai-workflow-engine-freeze-1" as const;

export const PRODUCT_AI_WORKFLOW_ENGINE_BASE =
  "enterprise-product-ai-prompt-engine-v1" as const;

export const PRODUCT_AI_WORKFLOW_FREEZE_TAG =
  "product-ai-workflow-engine-freeze-1" as const;

export const AI_WORKFLOW_KINDS = [
  "SEQUENTIAL",
  "BRANCHING",
  "PARALLEL",
  "INTERNAL",
] as const;

export const AI_WORKFLOW_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_WORKFLOW_VERSION_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "DEPRECATED",
  "RETIRED",
] as const;

export const AI_WORKFLOW_STEP_KINDS = [
  "PROMPT",
  "TRANSFORM",
  "GATE",
  "INTERNAL",
] as const;

export const AI_WORKFLOW_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
