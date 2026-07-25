/**
 * Product Billing Audit — Billing Traceability constants
 * MODULE: Billing Audit
 * BASE: enterprise-product-payment-integration-v1
 * Isolated namespace: lib/product/billing-audit
 */

export const PRODUCT_BILLING_AUDIT_ID =
  "enterprise-product-billing-audit-v1" as const;

export const PRODUCT_BILLING_AUDIT_VERSION =
  "product-billing-audit-1" as const;

export const PRODUCT_BILLING_AUDIT_FREEZE_VERSION =
  "product-billing-audit-freeze-1" as const;

export const PRODUCT_BILLING_AUDIT_BASE =
  "enterprise-product-payment-integration-v1" as const;

export const PRODUCT_BILLING_AUDIT_FREEZE_TAG =
  "product-billing-audit-freeze-1" as const;

export const BILLING_AUDIT_CATEGORIES = [
  "INVOICE",
  "PAYMENT",
  "SUBSCRIPTION",
  "USAGE",
] as const;

export const BILLING_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const BILLING_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
  "EXPORTED",
] as const;

export const BILLING_INTEGRITY_RESULTS = [
  "INTACT",
  "TAMPERED",
] as const;

export const BILLING_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const BILLING_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
