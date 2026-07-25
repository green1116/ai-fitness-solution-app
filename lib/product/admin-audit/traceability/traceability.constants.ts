/**
 * Product Admin Audit — Traceability constants
 * MODULE: Admin Audit
 * BASE: enterprise-product-compliance-governance-v1
 * Isolated namespace: lib/product/admin-audit
 */

export const PRODUCT_ADMIN_AUDIT_ID =
  "enterprise-product-admin-audit-v1" as const;

export const PRODUCT_ADMIN_AUDIT_VERSION =
  "product-admin-audit-1" as const;

export const PRODUCT_ADMIN_AUDIT_FREEZE_VERSION =
  "product-admin-audit-freeze-1" as const;

export const PRODUCT_ADMIN_AUDIT_BASE =
  "enterprise-product-compliance-governance-v1" as const;

export const PRODUCT_ADMIN_AUDIT_FREEZE_TAG =
  "product-admin-audit-freeze-1" as const;

export const ADMIN_AUDIT_CATEGORIES = [
  "ADMIN",
  "TENANT",
  "USER",
  "CONFIG",
  "OPERATIONS",
  "COMPLIANCE",
] as const;

export const ADMIN_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const ADMIN_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const ADMIN_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const ADMIN_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ADMIN_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
