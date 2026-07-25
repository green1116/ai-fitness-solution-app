/**
 * Product Relationship — Management constants
 * MODULE: Relationship
 * BASE: enterprise-product-customer-profile-v1
 * Isolated namespace: lib/product/relationship
 */

export const PRODUCT_RELATIONSHIP_MANAGEMENT_ID =
  "enterprise-product-relationship-management-v1" as const;

export const PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION =
  "product-relationship-1" as const;

export const PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION =
  "product-relationship-management-freeze-1" as const;

export const PRODUCT_RELATIONSHIP_MANAGEMENT_BASE =
  "enterprise-product-customer-profile-v1" as const;

export const PRODUCT_RELATIONSHIP_FREEZE_VERSION =
  "product-relationship-management-freeze-1" as const;

export const RELATIONSHIP_KINDS = [
  "PARTNER",
  "AFFILIATE",
  "BILLING_OWNER",
] as const;

export const RELATIONSHIP_STATUSES = [
  "PROSPECT",
  "ACTIVE",
  "DORMANT",
  "CLOSED",
] as const;

export const PARTY_ROLES = ["PRIMARY", "SECONDARY", "CONTACT"] as const;

export const CLASSIFICATION_TIERS = [
  "STRATEGIC",
  "STANDARD",
  "TRANSACTIONAL",
] as const;

export const RELATIONSHIP_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const RELATIONSHIP_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
