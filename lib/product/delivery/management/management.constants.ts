/**
 * Product Delivery — Engine constants
 * MODULE: Delivery (M06-P4)
 * BASE: enterprise-product-channel-management-v1
 * Isolated namespace: lib/product/delivery
 */

export const PRODUCT_DELIVERY_ENGINE_ID =
  "enterprise-product-delivery-engine-v1" as const;

export const PRODUCT_DELIVERY_ENGINE_VERSION =
  "product-delivery-1" as const;

export const PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION =
  "product-delivery-engine-freeze-1" as const;

export const PRODUCT_DELIVERY_ENGINE_BASE =
  "enterprise-product-channel-management-v1" as const;

export const PRODUCT_DELIVERY_FREEZE_VERSION =
  "product-delivery-engine-freeze-1" as const;

export const DELIVERY_REQUEST_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
] as const;

export const DELIVERY_PIPELINE_STAGES = [
  "ACCEPT",
  "VALIDATE",
  "PREPARE",
  "DISPATCH",
  "COMPLETE",
] as const;

export const DELIVERY_STATUSES = [
  "PENDING",
  "QUEUED",
  "DISPATCHING",
  "SUCCEEDED",
  "FAILED",
  "RETRYING",
] as const;

export const DELIVERY_RETRY_BACKOFFS = [
  "FIXED",
  "LINEAR",
  "EXPONENTIAL",
] as const;

export const DELIVERY_DISPATCH_CONTRACT_STATUSES = [
  "DRAFT",
  "BOUND",
  "RETIRED",
] as const;

export const DELIVERY_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DELIVERY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
