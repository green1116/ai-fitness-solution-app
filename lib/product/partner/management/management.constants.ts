/**
 * Product Partner — Management constants
 * MODULE: Partner Management (M08-P3)
 * BASE: enterprise-product-connector-framework-v1
 * Isolated namespace: lib/product/partner
 */

export const PRODUCT_PARTNER_MANAGEMENT_ID =
  "enterprise-product-partner-management-v1" as const;

export const PRODUCT_PARTNER_MANAGEMENT_VERSION =
  "product-partner-1" as const;

export const PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION =
  "product-partner-management-freeze-1" as const;

export const PRODUCT_PARTNER_MANAGEMENT_BASE =
  "enterprise-product-connector-framework-v1" as const;

export const PRODUCT_PARTNER_FREEZE_TAG =
  "product-partner-management-freeze-1" as const;

export const PARTNER_KINDS = [
  "ISV",
  "OEM",
  "RESELLER",
  "INTERNAL",
] as const;

export const PARTNER_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "RETIRED",
] as const;

export const PARTNER_AGREEMENT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "EXPIRED",
  "TERMINATED",
] as const;

export const PARTNER_ACCESS_STATUSES = [
  "GRANTED",
  "REVOKED",
  "PENDING",
] as const;

export const PARTNER_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PARTNER_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
