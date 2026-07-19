/**
 * E09-P4 — Federation Foundation constants
 * BASE: enterprise-e09-p3-market-freeze-v1
 */

export const E09_FEDERATION_ID =
  "enterprise-e09-federation-foundation-v1" as const;

export const E09_FEDERATION_VERSION = "e09-federation-1" as const;
export const E09_FEDERATION_FREEZE_VERSION =
  "e09-federation-freeze-1" as const;

export const E09_FEDERATION_BASE =
  "enterprise-e09-p3-market-freeze-v1" as const;

export const FEDERATION_SCOPES = [
  "GLOBAL",
  "REGIONAL",
  "MARKET",
  "NODE",
  "PARTNER",
] as const;

export const FEDERATION_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "REVOKED",
] as const;
