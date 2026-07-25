/**
 * Product Template — Management constants
 * MODULE: Template
 * BASE: enterprise-product-notification-foundation-v1
 * Isolated namespace: lib/product/template
 */

export const PRODUCT_TEMPLATE_MANAGEMENT_ID =
  "enterprise-product-template-management-v1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_VERSION =
  "product-template-1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_FREEZE_VERSION =
  "product-template-management-freeze-1" as const;

export const PRODUCT_TEMPLATE_MANAGEMENT_BASE =
  "enterprise-product-notification-foundation-v1" as const;

export const PRODUCT_TEMPLATE_FREEZE_VERSION =
  "product-template-management-freeze-1" as const;

export const TEMPLATE_DEFINITION_KINDS = [
  "TRANSACTIONAL",
  "ALERT",
  "MARKETING",
  "SYSTEM",
] as const;

export const TEMPLATE_DEFINITION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const TEMPLATE_VARIANT_LOCALES = [
  "EN",
  "ZH",
  "JA",
] as const;

export const TEMPLATE_VARIABLE_TYPES = [
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "DATE",
] as const;

export const TEMPLATE_PUBLISH_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "ROLLED_BACK",
] as const;

export const TEMPLATE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const TEMPLATE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
