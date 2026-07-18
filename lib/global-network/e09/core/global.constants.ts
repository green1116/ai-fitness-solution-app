/**
 * E09-P1 — Global Network Foundation constants
 * BASE: enterprise-e08-autonomous-enterprise-ecosystem-platform-freeze-v1
 */

export const E09_GLOBAL_NETWORK_PLATFORM_ID =
  "enterprise-e09-global-network-platform-v1" as const;

export const E09_GLOBAL_NETWORK_VERSION = "e09-global-1" as const;
export const E09_GLOBAL_NETWORK_FREEZE_VERSION =
  "e09-global-freeze-1" as const;

export const E09_GLOBAL_NETWORK_BASE =
  "enterprise-e08-autonomous-enterprise-ecosystem-platform-freeze-v1" as const;

export const GLOBAL_NODE_TYPES = [
  "ENTERPRISE",
  "REGION",
  "MARKET",
  "PARTNER",
  "GOVERNMENT",
  "AGENT",
] as const;

export const GLOBAL_NODE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CONNECTED",
] as const;

export const GLOBAL_EDGE_RELATIONS = [
  "PARTNER",
  "SUPPLIER",
  "CUSTOMER",
  "MARKET",
  "REGULATORY",
] as const;

/** Node lifecycle: created → registered → activated | suspended → removed */
export const GLOBAL_LIFECYCLE_STAGES = [
  "created",
  "registered",
  "activated",
  "suspended",
  "removed",
] as const;

export const GLOBAL_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["created", "registered"],
  ["registered", "activated"],
  ["activated", "suspended"],
  ["suspended", "activated"],
  ["registered", "removed"],
  ["activated", "removed"],
  ["suspended", "removed"],
] as const;
