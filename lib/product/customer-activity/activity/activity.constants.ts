/**
 * Product Customer Activity — Activity constants
 * MODULE: Customer Activity
 * BASE: enterprise-product-relationship-management-v1
 * Isolated namespace: lib/product/customer-activity
 */

export const PRODUCT_CUSTOMER_ACTIVITY_ID =
  "enterprise-product-customer-activity-v1" as const;

export const PRODUCT_CUSTOMER_ACTIVITY_VERSION =
  "product-customer-activity-1" as const;

export const PRODUCT_CUSTOMER_ACTIVITY_FREEZE_VERSION =
  "product-customer-activity-freeze-1" as const;

export const PRODUCT_CUSTOMER_ACTIVITY_BASE =
  "enterprise-product-relationship-management-v1" as const;

export const PRODUCT_CUSTOMER_ACTIVITY_LAYER_FREEZE_VERSION =
  "product-customer-activity-freeze-1" as const;

export const ACTIVITY_EVENT_KINDS = [
  "LOGIN",
  "PURCHASE",
  "SUPPORT",
  "ENGAGE",
] as const;

export const ACTIVITY_SESSION_STATUSES = [
  "OPEN",
  "CLOSED",
  "EXPIRED",
] as const;

export const ENGAGEMENT_LEVELS = ["LOW", "MEDIUM", "HIGH"] as const;

export const TIMELINE_ENTRY_KINDS = [
  "EVENT",
  "MILESTONE",
  "NOTE",
] as const;

export const CUSTOMER_ACTIVITY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CUSTOMER_ACTIVITY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
