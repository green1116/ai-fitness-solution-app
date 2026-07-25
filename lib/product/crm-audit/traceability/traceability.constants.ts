/**
 * Product CRM Audit — CRM Traceability constants
 * MODULE: CRM Audit
 * BASE: enterprise-product-customer-insight-v1
 * Isolated namespace: lib/product/crm-audit
 */

export const PRODUCT_CRM_AUDIT_ID =
  "enterprise-product-crm-audit-v1" as const;

export const PRODUCT_CRM_AUDIT_VERSION =
  "product-crm-audit-1" as const;

export const PRODUCT_CRM_AUDIT_FREEZE_VERSION =
  "product-crm-audit-freeze-1" as const;

export const PRODUCT_CRM_AUDIT_BASE =
  "enterprise-product-customer-insight-v1" as const;

export const PRODUCT_CRM_AUDIT_FREEZE_TAG =
  "product-crm-audit-freeze-1" as const;

export const CRM_AUDIT_CATEGORIES = [
  "CUSTOMER",
  "ORGANIZATION",
  "RELATIONSHIP",
  "ACTIVITY",
  "INSIGHT",
] as const;

export const CRM_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const CRM_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const CRM_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const CRM_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CRM_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
