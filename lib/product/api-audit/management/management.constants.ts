/**
 * Product API Audit — constants
 * MODULE: API Audit (M07-P7)
 * BASE: enterprise-product-api-governance-v1
 * Isolated namespace: lib/product/api-audit
 */

export const PRODUCT_API_AUDIT_ID =
  "enterprise-product-api-audit-v1" as const;

export const PRODUCT_API_AUDIT_VERSION =
  "product-api-audit-1" as const;

export const PRODUCT_API_AUDIT_FREEZE_VERSION =
  "product-api-audit-freeze-1" as const;

export const PRODUCT_API_AUDIT_BASE =
  "enterprise-product-api-governance-v1" as const;

export const PRODUCT_API_AUDIT_FREEZE_TAG =
  "product-api-audit-freeze-1" as const;

export const API_AUDIT_CATEGORIES = [
  "AUTH",
  "GATEWAY",
  "SDK",
  "PORTAL",
  "GOVERNANCE",
  "SYSTEM",
] as const;

export const API_AUDIT_SEVERITIES = ["INFO", "WARN", "CRITICAL"] as const;

export const API_AUDIT_TRAIL_STATUSES = ["RECORDED", "SEALED"] as const;

export const API_AUDIT_INTEGRITY_VERDICTS = [
  "INTACT",
  "TAMPERED",
  "UNKNOWN",
] as const;

export const API_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const API_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
