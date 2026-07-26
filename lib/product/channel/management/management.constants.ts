/**
 * Product Channel — Management constants
 * MODULE: Channel (M06-P3)
 * BASE: enterprise-product-template-management-v1
 * Isolated namespace: lib/product/channel
 */

export const PRODUCT_CHANNEL_MANAGEMENT_ID =
  "enterprise-product-channel-management-v1" as const;

export const PRODUCT_CHANNEL_MANAGEMENT_VERSION =
  "product-channel-1" as const;

export const PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION =
  "product-channel-management-freeze-1" as const;

export const PRODUCT_CHANNEL_MANAGEMENT_BASE =
  "enterprise-product-template-management-v1" as const;

export const PRODUCT_CHANNEL_FREEZE_VERSION =
  "product-channel-management-freeze-1" as const;

export const CHANNEL_KINDS = [
  "EMAIL",
  "SMS",
  "PUSH",
  "WEBHOOK",
  "IN_APP",
] as const;

export const CHANNEL_STATUSES = ["DRAFT", "ACTIVE", "RETIRED"] as const;

export const CHANNEL_CAPABILITY_FEATURES = [
  "SUPPORTS_TEMPLATE",
  "SUPPORTS_BATCH",
  "SUPPORTS_PRIORITY",
  "SUPPORTS_ATTACHMENTS",
] as const;

export const CHANNEL_POLICY_MODES = [
  "PERMISSIVE",
  "RESTRICTED",
  "STRICT",
] as const;

export const CHANNEL_VALIDATION_VERDICTS = [
  "VALID",
  "INVALID",
  "INCOMPLETE",
] as const;

export const CHANNEL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CHANNEL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
