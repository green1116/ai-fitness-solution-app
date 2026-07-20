/**
 * E10-P1 — Platform Foundation constants
 * BASE: enterprise-e09-global-autonomous-enterprise-network-freeze-v1
 */

export const E10_PLATFORM_ID =
  "enterprise-e10-platform-kernel-v1" as const;

export const E10_PLATFORM_VERSION = "e10-platform-1" as const;
export const E10_PLATFORM_FREEZE_VERSION =
  "e10-platform-freeze-1" as const;

export const E10_PLATFORM_BASE =
  "enterprise-e09-global-autonomous-enterprise-network-freeze-v1" as const;

export const PLATFORM_MODULE_KINDS = [
  "CORE",
  "RUNTIME",
  "SIGNOFF",
  "EXTENSION",
] as const;

export const PLATFORM_MODULE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "REGISTERED",
] as const;

/** Module lifecycle: created → registered → activated | suspended → removed */
export const PLATFORM_LIFECYCLE_STAGES = [
  "created",
  "registered",
  "activated",
  "suspended",
  "removed",
] as const;

export const PLATFORM_LIFECYCLE_TRANSITIONS: ReadonlyArray<
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

export const PLATFORM_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
