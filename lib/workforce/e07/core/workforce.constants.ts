/**
 * E07-P1 — Digital Workforce Foundation constants
 * BASE: enterprise-e06-autonomous-enterprise-os-freeze-v1
 */

export const E07_WORKFORCE_PLATFORM_ID =
  "enterprise-e07-digital-workforce-platform-v1" as const;

export const E07_WORKFORCE_VERSION = "e07-workforce-1" as const;
export const E07_WORKFORCE_FREEZE_VERSION =
  "e07-workforce-freeze-1" as const;

export const E07_WORKFORCE_BASE =
  "enterprise-e06-autonomous-enterprise-os-freeze-v1" as const;

export const WORKER_ROLES = [
  "observer",
  "analyst",
  "executor",
  "auditor",
  "escalator",
  "orchestrator",
] as const;

export const WORKER_STATUSES = [
  "registered",
  "ready",
  "working",
  "succeeded",
  "failed",
  "retired",
] as const;

export const WORKFORCE_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "bound",
  "activated",
  "completed",
] as const;

export const WORKFORCE_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "bound"],
  ["bound", "activated"],
  ["activated", "completed"],
] as const;

export const SKILL_KINDS = [
  "sense",
  "analyze",
  "execute",
  "verify",
  "report",
  "coordinate",
] as const;
