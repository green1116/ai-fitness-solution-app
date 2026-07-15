/**
 * E06-P1 — Autonomous Operation Foundation constants
 * BASE: enterprise-e05-intelligence-platform-freeze-v1
 */

export const E06_OPERATION_PLATFORM_ID =
  "enterprise-e06-autonomous-operation-platform-v1" as const;

export const E06_OPERATION_VERSION = "e06-operation-1" as const;
export const E06_OPERATION_FREEZE_VERSION =
  "e06-operation-freeze-1" as const;

export const E06_OPERATION_BASE =
  "enterprise-e05-intelligence-platform-freeze-v1" as const;

export const OPERATION_DOMAINS = [
  "observe",
  "decide",
  "act",
  "monitor",
  "escalate",
  "coordinate",
] as const;

export const OPERATION_STATUSES = [
  "registered",
  "ready",
  "running",
  "succeeded",
  "failed",
  "retired",
] as const;

export const OPERATION_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "bound",
  "activated",
  "completed",
] as const;

export const OPERATION_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "bound"],
  ["bound", "activated"],
  ["activated", "completed"],
] as const;

export const OPERATION_POLICY_KINDS = [
  "allow",
  "deny",
  "escalate",
  "audit",
  "gate",
  "throttle",
] as const;

export const OPERATION_POLICY_OPS = [
  "eq",
  "neq",
  "gte",
  "lte",
  "truthy",
  "falsy",
] as const;

export const OPERATION_POLICY_EFFECTS = [
  "allow",
  "deny",
  "escalate",
  "audit",
] as const;
