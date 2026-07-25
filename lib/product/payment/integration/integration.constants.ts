/**
 * Product Payment — Payment Integration constants
 * MODULE: Payment
 * BASE: enterprise-product-usage-metering-v1
 * Isolated namespace: lib/product/payment
 */

export const PRODUCT_PAYMENT_INTEGRATION_ID =
  "enterprise-product-payment-integration-v1" as const;

export const PRODUCT_PAYMENT_INTEGRATION_VERSION =
  "product-payment-1" as const;

export const PRODUCT_PAYMENT_INTEGRATION_FREEZE_VERSION =
  "product-payment-integration-freeze-1" as const;

export const PRODUCT_PAYMENT_INTEGRATION_BASE =
  "enterprise-product-usage-metering-v1" as const;

export const PRODUCT_PAYMENT_FREEZE_VERSION =
  "product-payment-integration-freeze-1" as const;

export const PAYMENT_PROVIDER_KINDS = [
  "CARD",
  "ACH",
  "WALLET",
] as const;

export const PROVIDER_STATUSES = [
  "ACTIVE",
  "DISABLED",
] as const;

export const INTENT_STATUSES = [
  "CREATED",
  "AUTHORIZED",
  "CAPTURED",
  "CANCELED",
] as const;

export const REFUND_RESULTS = [
  "REFUNDED",
  "PARTIAL",
  "FAILED",
] as const;

export const PAYMENT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PAYMENT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
