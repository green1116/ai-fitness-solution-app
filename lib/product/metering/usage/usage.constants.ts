/**
 * Product Metering — Usage Metering constants
 * MODULE: Usage Metering
 * BASE: enterprise-product-invoice-engine-v1
 * Isolated namespace: lib/product/metering
 */

export const PRODUCT_USAGE_METERING_ID =
  "enterprise-product-usage-metering-v1" as const;

export const PRODUCT_USAGE_METERING_VERSION =
  "product-metering-1" as const;

export const PRODUCT_USAGE_METERING_FREEZE_VERSION =
  "product-usage-metering-freeze-1" as const;

export const PRODUCT_USAGE_METERING_BASE =
  "enterprise-product-invoice-engine-v1" as const;

export const PRODUCT_METERING_FREEZE_VERSION =
  "product-usage-metering-freeze-1" as const;

export const METER_UNITS = [
  "COUNT",
  "SECONDS",
  "BYTES",
  "TOKENS",
] as const;

export const METER_STATUSES = [
  "ACTIVE",
  "PAUSED",
  "RETIRED",
] as const;

export const AGGREGATION_WINDOWS = [
  "HOURLY",
  "DAILY",
  "MONTHLY",
] as const;

export const RATING_RESULTS = [
  "RATED",
  "ZERO",
  "REJECTED",
] as const;

export const METERING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const METERING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
