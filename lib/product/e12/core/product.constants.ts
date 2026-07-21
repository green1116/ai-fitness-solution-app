/**
 * E12-P1 — Enterprise Product Foundation constants
 * BASE: enterprise-platform-v1-complete
 */

export const E12_PRODUCT_ID =
  "enterprise-e12-product-foundation-v1" as const;

export const E12_PRODUCT_VERSION = "e12-product-1" as const;
export const E12_PRODUCT_FREEZE_VERSION = "e12-product-freeze-1" as const;

export const E12_PRODUCT_BASE = "enterprise-platform-v1-complete" as const;

export const E12_P1_PRODUCT_FREEZE_VERSION =
  "e12-p1-product-foundation-freeze-1" as const;

export const PRODUCT_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEPRECATED",
  "ARCHIVED",
] as const;

export const PRODUCT_EDITION_KINDS = [
  "COMMUNITY",
  "STANDARD",
  "ENTERPRISE",
  "SOVEREIGN",
] as const;

export const FEATURE_CATEGORIES = [
  "CORE",
  "NETWORK",
  "PLATFORM",
  "RUNTIME",
  "GOVERNANCE",
  "OBSERVABILITY",
  "AUTONOMOUS",
  "CONTROL",
] as const;

export const FEATURE_AVAILABILITY = [
  "INCLUDED",
  "OPTIONAL",
  "PREVIEW",
  "DISABLED",
] as const;

export const CAPABILITY_PACKAGE_KINDS = [
  "BUNDLE",
  "ADDON",
  "EXTENSION",
] as const;

export const PRODUCT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
