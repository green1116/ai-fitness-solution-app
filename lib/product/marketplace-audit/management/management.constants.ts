/**
 * Product Marketplace Audit — constants
 * MODULE: Marketplace Audit (M08-P7)
 * BASE: enterprise-product-integration-governance-v1
 * Isolated namespace: lib/product/marketplace-audit
 */

export const PRODUCT_MARKETPLACE_AUDIT_ID =
  "enterprise-product-marketplace-audit-v1" as const;

export const PRODUCT_MARKETPLACE_AUDIT_VERSION =
  "product-marketplace-audit-1" as const;

export const PRODUCT_MARKETPLACE_AUDIT_FREEZE_VERSION =
  "product-marketplace-audit-freeze-1" as const;

export const PRODUCT_MARKETPLACE_AUDIT_BASE =
  "enterprise-product-integration-governance-v1" as const;

export const PRODUCT_MARKETPLACE_AUDIT_FREEZE_TAG =
  "product-marketplace-audit-freeze-1" as const;

export const MARKETPLACE_AUDIT_CATEGORIES = [
  "LISTING",
  "CATALOG",
  "APP",
  "PARTNER",
  "SURFACE",
  "GOVERNANCE",
] as const;

export const MARKETPLACE_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const MARKETPLACE_AUDIT_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
] as const;

export const MARKETPLACE_AUDIT_INTEGRITY_VERDICTS = [
  "INTACT",
  "TAMPERED",
  "UNKNOWN",
] as const;

export const MARKETPLACE_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const MARKETPLACE_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
