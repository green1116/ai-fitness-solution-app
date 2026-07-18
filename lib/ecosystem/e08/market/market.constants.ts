/**
 * E08-P6 — Autonomous Market Agent constants
 * BASE: enterprise-e08-p5-ecosystem-intelligence-v1
 */

export const E08_MARKET_AGENT_ID =
  "enterprise-e08-autonomous-market-agent-v1" as const;

export const E08_MARKET_VERSION = "e08-market-1" as const;
export const E08_MARKET_FREEZE_VERSION =
  "e08-market-freeze-1" as const;

export const E08_MARKET_BASE =
  "enterprise-e08-p5-ecosystem-intelligence-v1" as const;

export const MARKET_MISSIONS = [
  "capture",
  "expand",
  "stabilize",
] as const;

export const MARKET_POSTURES = [
  "aggressive",
  "balanced",
  "cautious",
  "corrective",
] as const;

export const MARKET_DIRECTIVE_KINDS = [
  "sense",
  "decide",
  "act",
  "monitor",
] as const;

export const MARKET_TRACE_EVENT_KINDS = [
  "ready",
  "intelligence",
  "reason",
  "decide",
  "result",
  "error",
] as const;
