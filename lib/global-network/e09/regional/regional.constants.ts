/**
 * E09-P2 — Regional Foundation constants
 * BASE: enterprise-e09-p1-global-network-freeze-v1
 */

export const E09_REGIONAL_ID =
  "enterprise-e09-regional-foundation-v1" as const;

export const E09_REGIONAL_VERSION = "e09-regional-1" as const;
export const E09_REGIONAL_FREEZE_VERSION =
  "e09-regional-freeze-1" as const;

export const E09_REGIONAL_BASE =
  "enterprise-e09-p1-global-network-freeze-v1" as const;

export const REGIONAL_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CONNECTED",
] as const;
