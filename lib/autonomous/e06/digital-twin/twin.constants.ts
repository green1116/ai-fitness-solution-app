/**
 * E06-P6 — Enterprise Digital Twin constants
 * BASE: enterprise-e06-p5-self-optimization-loop-v1
 */

export const E06_TWIN_ID =
  "enterprise-e06-enterprise-digital-twin-v1" as const;

export const E06_TWIN_VERSION = "e06-twin-1" as const;
export const E06_TWIN_FREEZE_VERSION = "e06-twin-freeze-1" as const;

export const E06_TWIN_BASE =
  "enterprise-e06-p5-self-optimization-loop-v1" as const;

export const TWIN_DOMAINS = [
  "operations",
  "risk",
  "delivery",
] as const;

export const TWIN_STATE_HEALTH = ["stable", "strained", "critical"] as const;

/** Twin lifecycle: MODELED -> SIMULATED -> PROJECTED -> RESULT */
export const TWIN_RUN_PHASES = [
  "MODELED",
  "SIMULATED",
  "PROJECTED",
  "RESULT",
] as const;

export const TWIN_RUN_TRANSITIONS: ReadonlyArray<readonly [string, string]> = [
  ["MODELED", "SIMULATED"],
  ["SIMULATED", "PROJECTED"],
  ["PROJECTED", "RESULT"],
] as const;

export const TWIN_TRACE_EVENT_KINDS = [
  "ready",
  "model",
  "simulate",
  "project",
  "result",
  "error",
] as const;
