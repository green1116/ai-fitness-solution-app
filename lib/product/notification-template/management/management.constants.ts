/**
 * Product Notification Template — Management constants
 * MODULE: Notification Template (M06-P2)
 * BASE: enterprise-product-notification-foundation-v1
 * Isolated namespace: lib/product/notification-template
 */

export const PRODUCT_TEMPLATE_MANAGEMENT_ID =
  "enterprise-product-template-management-v1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_VERSION =
  "product-notification-template-1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION =
  "product-notification-template-management-freeze-1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_BASE =
  "enterprise-product-notification-foundation-v1" as const;

export const PRODUCT_TEMPLATE_FREEZE_VERSION =
  "product-notification-template-management-freeze-1" as const;

export const NOTIFICATION_TEMPLATE_KINDS = [
  "TRANSACTIONAL",
  "ALERT",
  "MARKETING",
  "SYSTEM",
] as const;

export const NOTIFICATION_TEMPLATE_LOCALES = [
  "EN",
  "ZH",
  "JA",
] as const;

export const NOTIFICATION_TEMPLATE_VARIABLE_TYPES = [
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "DATE",
] as const;

export const NOTIFICATION_TEMPLATE_VERSION_STATES = [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const NOTIFICATION_TEMPLATE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const NOTIFICATION_TEMPLATE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
