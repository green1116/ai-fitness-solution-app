/**
 * E05-P6 — Enterprise Simulation Runtime constants
 * BASE: enterprise-e05-optimization-engine-v1
 */

export const E05_SIMULATION_RUNTIME_ID =
  "enterprise-e05-enterprise-simulation-runtime-v1" as const;

export const E05_SIMULATION_VERSION = "e05-simulation-1" as const;
export const E05_SIMULATION_FREEZE_VERSION = "e05-simulation-freeze-1" as const;

export const E05_SIMULATION_BASE =
  "enterprise-e05-optimization-engine-v1" as const;

export const SIMULATION_SCENARIO_KINDS = [
  "baseline",
  "optimistic",
  "pessimistic",
  "stress",
] as const;

export const SIMULATION_TRACE_EVENT_KINDS = [
  "ready",
  "scenario",
  "optimize",
  "compare",
  "result",
  "error",
] as const;
