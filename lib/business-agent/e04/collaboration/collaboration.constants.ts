/**
 * E04-P7 — Enterprise Agent Collaboration Runtime constants
 * BASE: enterprise-e04-p6-business-knowledge-runtime-v1
 */

export const E04_COLLABORATION_RUNTIME_ID =
  "enterprise-e04-enterprise-agent-collaboration-v1" as const;

export const E04_COLLABORATION_VERSION = "e04-collaboration-1" as const;
export const E04_COLLABORATION_FREEZE_VERSION =
  "e04-collaboration-freeze-1" as const;

export const E04_COLLABORATION_BASE =
  "enterprise-e04-p6-business-knowledge-runtime-v1" as const;

export const COLLABORATION_PARTICIPANT_ROLES = [
  "lead",
  "contributor",
  "reviewer",
] as const;

export const COLLABORATION_MESSAGE_KINDS = [
  "announce",
  "propose",
  "ask",
  "reply",
  "vote",
  "commit",
] as const;

export const COLLABORATION_PROTOCOL_PHASES = [
  "open",
  "exchange",
  "consolidate",
  "closed",
] as const;

export const COLLABORATION_TRACE_EVENT_KINDS = [
  "register",
  "message",
  "turn",
  "execute",
  "result",
  "error",
] as const;
