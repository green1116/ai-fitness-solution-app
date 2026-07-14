/**
 * E03-P1 — Enterprise Autonomous Agent Platform constants
 * BASE: enterprise-e03-autonomous-agent-platform-v1
 */

export const E03_AGENT_PLATFORM_ID =
  "enterprise-e03-autonomous-agent-platform-v1" as const;

export const E03_AGENT_PLATFORM_VERSION = "e03-agent-platform-1" as const;
export const E03_AGENT_PLATFORM_FREEZE_VERSION =
  "e03-agent-platform-freeze-1" as const;

export const AGENT_ROLES = [
  "planner",
  "worker",
  "critic",
  "memory",
  "tool",
  "coordinator",
] as const;

export const AGENT_CAPABILITIES = [
  "plan",
  "execute",
  "evaluate",
  "remember",
  "invoke",
  "orchestrate",
] as const;

export const AGENT_STATUSES = [
  "registered",
  "ready",
  "running",
  "paused",
  "succeeded",
  "failed",
  "retired",
] as const;

export const AGENT_LIFECYCLE_STAGES = [
  "declared",
  "registered",
  "activated",
  "executing",
  "completed",
] as const;

export const AGENT_LIFECYCLE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["declared", "registered"],
  ["registered", "activated"],
  ["activated", "executing"],
  ["executing", "completed"],
] as const;
