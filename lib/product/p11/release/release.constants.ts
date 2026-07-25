/**
 * Product P11 — Commercial Release constants
 * BASE: enterprise-product-p10-subscription-billing-v1
 * Isolated namespace: lib/product/p11
 */

export const PRODUCT_P11_COMMERCIAL_RELEASE_ID =
  "enterprise-product-p11-commercial-release-v1" as const;

export const PRODUCT_P11_COMMERCIAL_RELEASE_VERSION =
  "product-p11-1" as const;

export const PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION =
  "product-p11-commercial-release-freeze-1" as const;

export const PRODUCT_P11_COMMERCIAL_RELEASE_BASE =
  "enterprise-product-p10-subscription-billing-v1" as const;

export const PRODUCT_P11_COMMERCIAL_FREEZE_VERSION =
  "product-p11-commercial-release-freeze-1" as const;

export const RELEASE_STATUSES = [
  "PLANNED",
  "STAGED",
  "LIVE",
  "ROLLED_BACK",
  "ARCHIVED",
] as const;

export const FEATURE_FLAGS = [
  "DISABLED",
  "BETA",
  "GA",
  "DEPRECATED",
] as const;

export const VERSION_CHANNELS = [
  "ALPHA",
  "BETA",
  "STABLE",
  "LTS",
] as const;

export const TENANT_STATUSES = [
  "PROVISIONING",
  "ACTIVE",
  "SUSPENDED",
  "DECOMMISSIONED",
] as const;

export const ENVIRONMENT_KINDS = [
  "DEV",
  "STAGING",
  "PRODUCTION",
  "DR",
] as const;

export const DEPLOYMENT_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
  "SUCCEEDED",
  "FAILED",
  "ROLLED_BACK",
] as const;

export const LICENSE_STATUSES = [
  "ISSUED",
  "ACTIVE",
  "EXPIRED",
  "REVOKED",
] as const;

export const P11_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const P11_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
