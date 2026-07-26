/**
 * Product Notification Audit — constants
 * MODULE: Notification Audit (M06-P7)
 * BASE: enterprise-product-routing-engine-v1
 * Isolated namespace: lib/product/notification-audit
 */

export const PRODUCT_NOTIFICATION_AUDIT_ID =
  "enterprise-product-notification-audit-v1" as const;

export const PRODUCT_NOTIFICATION_AUDIT_VERSION =
  "product-notification-audit-1" as const;

export const PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION =
  "product-notification-audit-freeze-1" as const;

export const PRODUCT_NOTIFICATION_AUDIT_BASE =
  "enterprise-product-routing-engine-v1" as const;

export const PRODUCT_NOTIFICATION_AUDIT_FREEZE_VERSION_TAG =
  "product-notification-audit-freeze-1" as const;

export const NOTIFICATION_AUDIT_CATEGORIES = [
  "TEMPLATE",
  "CHANNEL",
  "DELIVERY",
  "PREFERENCE",
  "ROUTING",
  "SYSTEM",
] as const;

export const NOTIFICATION_AUDIT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const NOTIFICATION_AUDIT_TRAIL_STATUSES = [
  "RECORDED",
  "SEALED",
] as const;

export const NOTIFICATION_AUDIT_INTEGRITY_VERDICTS = [
  "INTACT",
  "TAMPERED",
  "UNKNOWN",
] as const;

export const NOTIFICATION_AUDIT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const NOTIFICATION_AUDIT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
