/**
 * Product Notification — Notification Foundation constants
 * MODULE: Notification
 * BASE: enterprise-product-admin-baseline-v1
 * Isolated namespace: lib/product/notification
 */

export const PRODUCT_NOTIFICATION_FOUNDATION_ID =
  "enterprise-product-notification-foundation-v1" as const;

export const PRODUCT_NOTIFICATION_FOUNDATION_VERSION =
  "product-notification-1" as const;

export const PRODUCT_NOTIFICATION_FOUNDATION_FREEZE_VERSION =
  "product-notification-foundation-freeze-1" as const;

export const PRODUCT_NOTIFICATION_FOUNDATION_BASE =
  "enterprise-product-admin-baseline-v1" as const;

export const PRODUCT_NOTIFICATION_FREEZE_VERSION =
  "product-notification-foundation-freeze-1" as const;

export const NOTIFICATION_CHANNEL_KINDS = [
  "EMAIL",
  "SMS",
  "PUSH",
  "IN_APP",
] as const;

export const NOTIFICATION_CHANNEL_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DISABLED",
] as const;

export const NOTIFICATION_TEMPLATE_KINDS = [
  "TRANSACTIONAL",
  "ALERT",
  "MARKETING",
] as const;

export const NOTIFICATION_MESSAGE_PRIORITIES = [
  "LOW",
  "NORMAL",
  "HIGH",
] as const;

export const NOTIFICATION_DELIVERY_STATUSES = [
  "QUEUED",
  "SENT",
  "FAILED",
  "DELIVERED",
] as const;

export const NOTIFICATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const NOTIFICATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
