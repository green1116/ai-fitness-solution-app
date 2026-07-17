/**
 * E06-P7 — Autonomous Enterprise Agent constants
 * BASE: enterprise-e06-p6-enterprise-digital-twin-v1
 */

export const E06_AGENT_ID =
  "enterprise-e06-autonomous-enterprise-agent-v1" as const;

export const E06_AGENT_VERSION = "e06-agent-1" as const;
export const E06_AGENT_FREEZE_VERSION = "e06-agent-freeze-1" as const;

export const E06_AGENT_BASE =
  "enterprise-e06-p6-enterprise-digital-twin-v1" as const;

export const AGENT_MISSIONS = [
  "growth",
  "stability",
  "recovery",
] as const;

export const AGENT_POSTURES = [
  "proactive",
  "balanced",
  "conservative",
  "corrective",
] as const;

export const AGENT_DIRECTIVE_KINDS = [
  "observe",
  "decide",
  "act",
  "monitor",
] as const;

export const AGENT_TRACE_EVENT_KINDS = [
  "ready",
  "twin",
  "reason",
  "decide",
  "result",
  "error",
] as const;
