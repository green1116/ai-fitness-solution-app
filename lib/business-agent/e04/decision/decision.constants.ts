/**
 * E04-P4 — Business Decision Runtime constants
 * BASE: enterprise-e04-p3-business-process-orchestration-v1
 */

export const E04_DECISION_RUNTIME_ID =
  "enterprise-e04-business-decision-runtime-v1" as const;

export const E04_DECISION_VERSION = "e04-decision-1" as const;
export const E04_DECISION_FREEZE_VERSION = "e04-decision-freeze-1" as const;

export const E04_DECISION_BASE =
  "enterprise-e04-p3-business-process-orchestration-v1" as const;

export const DECISION_OUTCOMES = [
  "approve",
  "reject",
  "escalate",
  "defer",
] as const;

export const DECISION_POLICY_OPS = [
  "eq",
  "neq",
  "gte",
  "lte",
  "truthy",
  "falsy",
] as const;

export const DECISION_TRACE_EVENT_KINDS = [
  "ready",
  "evaluate",
  "policy",
  "outcome",
  "process",
  "result",
  "error",
] as const;
