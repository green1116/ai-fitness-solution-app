/**
 * E05-P7 — Autonomous Strategy Agent constants
 * BASE: enterprise-e05-enterprise-simulation-runtime-v1
 */

export const E05_STRATEGY_AGENT_ID =
  "enterprise-e05-autonomous-strategy-agent-v1" as const;

export const E05_STRATEGY_VERSION = "e05-strategy-1" as const;
export const E05_STRATEGY_FREEZE_VERSION = "e05-strategy-freeze-1" as const;

export const E05_STRATEGY_BASE =
  "enterprise-e05-enterprise-simulation-runtime-v1" as const;

export const STRATEGY_STANCES = [
  "aggressive",
  "balanced",
  "defensive",
  "adaptive",
] as const;

export const STRATEGY_PLAN_STEP_KINDS = [
  "observe",
  "decide",
  "act",
  "monitor",
] as const;

export const STRATEGY_TRACE_EVENT_KINDS = [
  "ready",
  "simulate",
  "plan",
  "compose",
  "result",
  "error",
] as const;
