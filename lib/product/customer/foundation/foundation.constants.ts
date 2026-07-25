/**
 * Product Customer — Customer Foundation constants
 * MODULE: Customer
 * BASE: enterprise-product-billing-baseline-v1
 * Isolated namespace: lib/product/customer
 */

export const PRODUCT_CUSTOMER_FOUNDATION_ID =
  "enterprise-product-customer-foundation-v1" as const;

export const PRODUCT_CUSTOMER_FOUNDATION_VERSION =
  "product-customer-1" as const;

export const PRODUCT_CUSTOMER_FOUNDATION_FREEZE_VERSION =
  "product-customer-foundation-freeze-1" as const;

export const PRODUCT_CUSTOMER_FOUNDATION_BASE =
  "enterprise-product-billing-baseline-v1" as const;

export const PRODUCT_CUSTOMER_FREEZE_VERSION =
  "product-customer-foundation-freeze-1" as const;

export const CUSTOMER_KINDS = [
  "INDIVIDUAL",
  "ORGANIZATION",
  "PARTNER",
] as const;

export const CUSTOMER_STATUSES = [
  "PROSPECT",
  "ACTIVE",
  "CHURNED",
  "BLOCKED",
] as const;

export const CUSTOMER_SEGMENTS = [
  "SMB",
  "MID_MARKET",
  "ENTERPRISE",
] as const;

export const RELATIONSHIP_KINDS = [
  "BILLING",
  "PRIMARY",
  "CONTACT",
] as const;

export const CUSTOMER_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CUSTOMER_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
