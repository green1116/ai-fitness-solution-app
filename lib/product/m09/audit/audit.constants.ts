/**
 * Product M09 — AI Audit constants
 * MODULE: AI Audit (M09-P7)
 * BASE: enterprise-product-ai-governance-v1
 * Isolated namespace: lib/product/m09/audit
 * Declaration only — no runtime / execution / agent / tools / monitoring
 */

export const PRODUCT_AI_AUDIT_ID = "enterprise-product-ai-audit-v1" as const;

export const PRODUCT_AI_AUDIT_VERSION = "product-ai-audit-1" as const;

export const PRODUCT_AI_AUDIT_FREEZE_VERSION =
  "product-ai-audit-freeze-1" as const;

export const PRODUCT_AI_AUDIT_BASE =
  "enterprise-product-ai-governance-v1" as const;

export const PRODUCT_AI_AUDIT_FREEZE_TAG =
  "product-ai-audit-freeze-1" as const;

export const AI_AUDIT_EVENT_KINDS = [
  "MODEL_BOUNDARY",
  "PROMPT_SAFETY",
  "WORKFLOW_CONTROL",
  "ORCHESTRATION_SCOPE",
] as const;

export const AI_AUDIT_SEVERITIES = ["INFO", "WARN", "CRITICAL"] as const;

export const AI_AUDIT_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const AI_AUDIT_INTEGRITY_RESULTS = ["INTACT", "TAMPERED"] as const;

export const AI_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
