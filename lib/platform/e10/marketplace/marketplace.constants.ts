/**
 * E10-P6 — Platform Marketplace constants
 * BASE: enterprise-e10-p5-platform-gateway-v1
 */

export const E10_MARKETPLACE_ID =
  "enterprise-e10-platform-marketplace-v1" as const;

export const E10_MARKETPLACE_VERSION = "e10-marketplace-1" as const;
export const E10_MARKETPLACE_FREEZE_VERSION =
  "e10-marketplace-freeze-1" as const;

export const E10_MARKETPLACE_BASE =
  "enterprise-e10-p5-platform-gateway-v1" as const;

export const CATALOG_ENTRY_KINDS = [
  "PLUGIN",
  "PACKAGE",
  "BUNDLE",
] as const;

export const CATALOG_ENTRY_STATUSES = [
  "LISTED",
  "UNLISTED",
  "DEPRECATED",
] as const;

export const PLUGIN_STATUSES = [
  "REGISTERED",
  "ENABLED",
  "DISABLED",
  "REMOVED",
] as const;

export const PACKAGE_STATUSES = [
  "AVAILABLE",
  "INSTALLED",
  "UNINSTALLED",
  "REMOVED",
] as const;

export const INSTALL_STATUSES = [
  "PENDING",
  "INSTALLED",
  "FAILED",
  "UNINSTALLED",
] as const;

export const MARKETPLACE_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
