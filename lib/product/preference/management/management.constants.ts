/**
 * Product Preference — Management constants
 * MODULE: Preference (M06-P5)
 * BASE: enterprise-product-delivery-engine-v1
 * Isolated namespace: lib/product/preference
 */

export const PRODUCT_PREFERENCE_MANAGEMENT_ID =
  "enterprise-product-preference-management-v1" as const;

export const PRODUCT_PREFERENCE_MANAGEMENT_VERSION =
  "product-preference-1" as const;

export const PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION =
  "product-preference-management-freeze-1" as const;

export const PRODUCT_PREFERENCE_MANAGEMENT_BASE =
  "enterprise-product-delivery-engine-v1" as const;

export const PRODUCT_PREFERENCE_FREEZE_VERSION =
  "product-preference-management-freeze-1" as const;

export const PREFERENCE_KINDS = [
  "TRANSACTIONAL",
  "ALERT",
  "MARKETING",
  "SYSTEM",
] as const;

export const PREFERENCE_SCOPE_LEVELS = [
  "GLOBAL",
  "TENANT",
  "USER",
  "CHANNEL",
] as const;

export const PREFERENCE_CONSENT_STATES = [
  "GRANTED",
  "DENIED",
  "OPTED_OUT",
  "REVOKED",
] as const;

export const PREFERENCE_RESOLUTION_STRATEGIES = [
  "MOST_SPECIFIC",
  "DENY_OVERRIDES",
  "GRANT_OVERRIDES",
] as const;

export const PREFERENCE_VALIDATION_VERDICTS = [
  "VALID",
  "INVALID",
  "INCOMPLETE",
] as const;

export const PREFERENCE_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const PREFERENCE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
