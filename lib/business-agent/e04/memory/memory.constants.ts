/**
 * E04-P5 — Business Memory Runtime constants
 * BASE: enterprise-e04-p4-business-decision-runtime-v1
 */

export const E04_MEMORY_RUNTIME_ID =
  "enterprise-e04-business-memory-runtime-v1" as const;

export const E04_MEMORY_VERSION = "e04-memory-1" as const;
export const E04_MEMORY_FREEZE_VERSION = "e04-memory-freeze-1" as const;

export const E04_MEMORY_BASE =
  "enterprise-e04-p4-business-decision-runtime-v1" as const;

export const MEMORY_SCOPES = [
  "agent",
  "workflow",
  "process",
  "decision",
  "shared",
] as const;

export const MEMORY_KINDS = [
  "note",
  "fact",
  "outcome",
  "artifact",
  "context",
] as const;

export const MEMORY_TRACE_EVENT_KINDS = [
  "write",
  "index",
  "retrieve",
  "result",
  "error",
] as const;
