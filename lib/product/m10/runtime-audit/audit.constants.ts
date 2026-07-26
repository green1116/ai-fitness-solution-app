/**
 * Product M10 — AI Runtime Audit constants
 * MODULE: Runtime Audit (M10-P7)
 * BASE: enterprise-product-ai-runtime-governance-v1
 * Isolated namespace: lib/product/m10/runtime-audit
 * Definition only — no allocation / execution / monitoring
 */

export const PRODUCT_AI_RUNTIME_AUDIT_ID =
  "enterprise-product-ai-runtime-audit-v1" as const;

export const PRODUCT_AI_RUNTIME_AUDIT_VERSION =
  "product-ai-runtime-audit-1" as const;

export const PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION =
  "product-ai-runtime-audit-freeze-1" as const;

export const PRODUCT_AI_RUNTIME_AUDIT_BASE =
  "enterprise-product-ai-runtime-governance-v1" as const;

export const PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG =
  "product-ai-runtime-audit-freeze-1" as const;

export const AI_RUNTIME_AUDIT_EVENT_KINDS = [
  "JOB_BOUNDARY",
  "QUEUE_CONTROL",
  "SCHEDULE_SCOPE",
  "RESOURCE_LIMIT",
] as const;

export const AI_RUNTIME_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const AI_RUNTIME_AUDIT_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const AI_RUNTIME_AUDIT_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const AI_RUNTIME_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;
