/**
 * E07-P5 — Human-AI Collaboration constants
 * BASE: enterprise-e07-p4-workforce-orchestration-v1
 */

export const E07_COLLABORATION_ID =
  "enterprise-e07-human-ai-collaboration-v1" as const;

export const E07_COLLABORATION_VERSION = "e07-collaboration-1" as const;
export const E07_COLLABORATION_FREEZE_VERSION =
  "e07-collaboration-freeze-1" as const;

export const E07_COLLABORATION_BASE =
  "enterprise-e07-p4-workforce-orchestration-v1" as const;

export const COLLABORATION_MODES = [
  "review",
  "approve",
  "co-work",
] as const;

export const HUMAN_DECISIONS = [
  "approve",
  "reject",
  "defer",
] as const;

export const HUMAN_REQUEST_STATUSES = [
  "pending",
  "decided",
  "expired",
] as const;

/** Session lifecycle: REQUESTED -> DECIDED -> RUNNING -> RESULT */
export const COLLABORATION_SESSION_PHASES = [
  "REQUESTED",
  "DECIDED",
  "RUNNING",
  "RESULT",
] as const;

export const COLLABORATION_SESSION_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["REQUESTED", "DECIDED"],
  ["DECIDED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const COLLABORATION_TRACE_EVENT_KINDS = [
  "ready",
  "request",
  "decision",
  "orchestrate",
  "result",
  "error",
] as const;
