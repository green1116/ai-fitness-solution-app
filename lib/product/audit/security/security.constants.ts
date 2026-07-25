/**
 * Product Audit — Security Traceability constants
 * MODULE: Audit
 * BASE: enterprise-product-sso-federation-v1
 * Isolated namespace: lib/product/audit
 */

export const PRODUCT_AUDIT_TRACEABILITY_ID =
  "enterprise-product-audit-traceability-v1" as const;

export const PRODUCT_AUDIT_TRACEABILITY_VERSION =
  "product-audit-1" as const;

export const PRODUCT_AUDIT_TRACEABILITY_FREEZE_VERSION =
  "product-audit-traceability-freeze-1" as const;

export const PRODUCT_AUDIT_TRACEABILITY_BASE =
  "enterprise-product-sso-federation-v1" as const;

export const PRODUCT_AUDIT_FREEZE_VERSION =
  "product-audit-traceability-freeze-1" as const;

export const AUDIT_EVENT_CATEGORIES = [
  "AUTH",
  "ACCESS",
  "ADMIN",
  "SECURITY",
] as const;

export const AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const AUDIT_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const AUDIT_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
