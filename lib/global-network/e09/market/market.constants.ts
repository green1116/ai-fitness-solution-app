/**
 * E09-P3 — Market Foundation constants
 * BASE: enterprise-e09-p2-regional-freeze-v1
 */

export const E09_MARKET_ID =
  "enterprise-e09-market-foundation-v1" as const;

export const E09_MARKET_VERSION = "e09-market-1" as const;
export const E09_MARKET_FREEZE_VERSION =
  "e09-market-freeze-1" as const;

export const E09_MARKET_BASE =
  "enterprise-e09-p2-regional-freeze-v1" as const;

export const MARKET_TYPES = [
  "CONSUMER",
  "ENTERPRISE",
  "PARTNER",
  "GOVERNMENT",
  "CROSS_BORDER",
] as const;

export const MARKET_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CONNECTED",
] as const;
