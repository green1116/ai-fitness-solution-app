/**
 * E04-P1 — Business Agent Foundation constants
 * BASE: enterprise-e03-autonomous-agent-platform-v1
 */

export const E04_BUSINESS_AGENT_PLATFORM_ID =
  "enterprise-e04-business-agent-platform-v1" as const;

export const E04_BUSINESS_AGENT_VERSION = "e04-business-agent-1" as const;
export const E04_BUSINESS_AGENT_FREEZE_VERSION =
  "e04-business-agent-freeze-1" as const;

export const E04_BUSINESS_AGENT_BASE =
  "enterprise-e03-autonomous-agent-platform-v1" as const;

export const BUSINESS_AGENT_DOMAINS = [
  "tender",
  "budget",
  "equipment",
  "compliance",
  "delivery",
  "coordination",
] as const;

export const BUSINESS_AGENT_STATUSES = [
  "registered",
  "ready",
  "running",
  "succeeded",
  "failed",
  "retired",
] as const;

export const BUSINESS_AGENT_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "bound",
  "activated",
  "completed",
] as const;

export const BUSINESS_AGENT_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "bound"],
  ["bound", "activated"],
  ["activated", "completed"],
] as const;

export const BUSINESS_CAPABILITY_KINDS = [
  "intake",
  "estimate",
  "propose",
  "review",
  "price",
  "deliver",
  "coordinate",
] as const;
