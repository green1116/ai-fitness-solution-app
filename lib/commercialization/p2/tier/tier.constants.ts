/**
 * Commercialization P2 — Product Packaging Foundation constants
 * BASE: enterprise-commercialization-p1-sales-foundation-v1
 * Isolated namespace: lib/commercialization/p2
 */

export const COMMERCIALIZATION_PRODUCT_PACKAGING_ID =
  "enterprise-commercialization-p2-product-packaging-foundation-v1" as const;

export const COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION =
  "commercialization-p2-1" as const;

export const COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION =
  "commercialization-product-packaging-foundation-freeze-1" as const;

export const COMMERCIALIZATION_PRODUCT_PACKAGING_BASE =
  "enterprise-commercialization-p1-sales-foundation-v1" as const;

export const COMMERCIALIZATION_P2_PACKAGING_FREEZE_VERSION =
  "commercialization-p2-product-packaging-foundation-freeze-1" as const;

export const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
] as const;

export const PACKAGE_KINDS = [
  "CORE",
  "ADDON",
  "BUNDLE",
  "CUSTOM",
] as const;

export const PACKAGE_STATUSES = [
  "DRAFT",
  "COMPOSED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const TIER_LEVELS = [
  "STARTER",
  "GROWTH",
  "PROFESSIONAL",
  "ENTERPRISE",
] as const;

export const DELIVERY_SCOPES = [
  "SELF_SERVE",
  "ASSISTED",
  "MANAGED",
  "CUSTOM",
] as const;

export const DELIVERY_MODELS = [
  "SAAS",
  "HYBRID",
  "ON_PREM",
] as const;

export const PACKAGING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PACKAGING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
