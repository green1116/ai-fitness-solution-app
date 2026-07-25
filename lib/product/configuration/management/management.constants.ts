/**
 * Product Configuration — System Configuration constants
 * MODULE: System Configuration
 * BASE: enterprise-product-user-administration-v1
 * Isolated namespace: lib/product/configuration
 */

export const PRODUCT_SYSTEM_CONFIGURATION_ID =
  "enterprise-product-system-configuration-v1" as const;

export const PRODUCT_SYSTEM_CONFIGURATION_VERSION =
  "product-configuration-1" as const;

export const PRODUCT_SYSTEM_CONFIGURATION_FREEZE_VERSION =
  "product-system-configuration-freeze-1" as const;

export const PRODUCT_SYSTEM_CONFIGURATION_BASE =
  "enterprise-product-user-administration-v1" as const;

export const PRODUCT_CONFIGURATION_FREEZE_VERSION =
  "product-system-configuration-freeze-1" as const;

export const CONFIG_NAMESPACE_SCOPES = [
  "GLOBAL",
  "TENANT",
  "USER",
] as const;

export const CONFIG_NAMESPACE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "RETIRED",
] as const;

export const CONFIG_PARAMETER_TYPES = [
  "STRING",
  "NUMBER",
  "BOOLEAN",
  "JSON",
] as const;

export const CONFIG_OVERRIDE_TARGETS = [
  "TENANT",
  "USER",
  "ENVIRONMENT",
] as const;

export const CONFIG_RELEASE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ACTIVE",
  "ROLLED_BACK",
] as const;

export const CONFIGURATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CONFIGURATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
