/**
 * E08-P1 — Enterprise Ecosystem Foundation constants
 * BASE: enterprise-e07-digital-workforce-platform-freeze-v1
 */

export const E08_ECOSYSTEM_PLATFORM_ID =
  "enterprise-e08-enterprise-ecosystem-platform-v1" as const;

export const E08_ECOSYSTEM_VERSION = "e08-ecosystem-1" as const;
export const E08_ECOSYSTEM_FREEZE_VERSION =
  "e08-ecosystem-freeze-1" as const;

export const E08_ECOSYSTEM_BASE =
  "enterprise-e07-digital-workforce-platform-freeze-v1" as const;

export const ECOSYSTEM_DOMAINS = [
  "supplier",
  "channel",
  "customer",
  "regulator",
  "partner",
  "hub",
] as const;

export const ECOSYSTEM_STATUSES = [
  "registered",
  "ready",
  "connected",
  "succeeded",
  "failed",
  "retired",
] as const;

export const ECOSYSTEM_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "bound",
  "activated",
  "completed",
] as const;

export const ECOSYSTEM_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "bound"],
  ["bound", "activated"],
  ["activated", "completed"],
] as const;

export const RELATIONSHIP_KINDS = [
  "supply",
  "distribute",
  "serve",
  "comply",
  "alliance",
  "coordinate",
] as const;
