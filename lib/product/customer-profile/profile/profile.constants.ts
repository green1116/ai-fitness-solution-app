/**
 * Product Customer Profile — Profile constants
 * MODULE: Customer Profile
 * BASE: enterprise-product-organization-management-v1
 * Isolated namespace: lib/product/customer-profile
 */

export const PRODUCT_CUSTOMER_PROFILE_ID =
  "enterprise-product-customer-profile-v1" as const;

export const PRODUCT_CUSTOMER_PROFILE_VERSION =
  "product-customer-profile-1" as const;

export const PRODUCT_CUSTOMER_PROFILE_FREEZE_VERSION =
  "product-customer-profile-freeze-1" as const;

export const PRODUCT_CUSTOMER_PROFILE_BASE =
  "enterprise-product-organization-management-v1" as const;

export const PRODUCT_CUSTOMER_PROFILE_LAYER_FREEZE_VERSION =
  "product-customer-profile-freeze-1" as const;

export const PROFILE_STATUSES = ["DRAFT", "ACTIVE", "ARCHIVED"] as const;

export const CONTACT_KINDS = ["EMAIL", "PHONE", "ADDRESS"] as const;

export const PREFERENCE_KINDS = [
  "COMMUNICATION",
  "BILLING",
  "PRODUCT",
] as const;

export const ATTRIBUTE_KINDS = ["LABEL", "TAG", "CUSTOM"] as const;

export const CUSTOMER_PROFILE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CUSTOMER_PROFILE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
