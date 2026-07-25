/**
 * Product Invoice — Invoice Engine constants
 * MODULE: Invoice
 * BASE: enterprise-product-pricing-management-v1
 * Isolated namespace: lib/product/invoice
 */

export const PRODUCT_INVOICE_ENGINE_ID =
  "enterprise-product-invoice-engine-v1" as const;

export const PRODUCT_INVOICE_ENGINE_VERSION =
  "product-invoice-1" as const;

export const PRODUCT_INVOICE_ENGINE_FREEZE_VERSION =
  "product-invoice-engine-freeze-1" as const;

export const PRODUCT_INVOICE_ENGINE_BASE =
  "enterprise-product-pricing-management-v1" as const;

export const PRODUCT_INVOICE_FREEZE_VERSION =
  "product-invoice-engine-freeze-1" as const;

export const DOCUMENT_STATUSES = [
  "DRAFT",
  "ISSUED",
  "SETTLED",
  "VOID",
] as const;

export const LINE_KINDS = [
  "CHARGE",
  "CREDIT",
  "TAX",
] as const;

export const TAX_MODES = [
  "EXCLUSIVE",
  "INCLUSIVE",
  "NONE",
] as const;

export const SETTLEMENT_RESULTS = [
  "SETTLED",
  "PARTIAL",
  "FAILED",
] as const;

export const INVOICE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const INVOICE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
