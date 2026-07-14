/**
 * E05-P5 — Optimization Engine constants
 * BASE: enterprise-e05-forecasting-runtime-v1
 */

export const E05_OPTIMIZATION_ENGINE_ID =
  "enterprise-e05-optimization-engine-v1" as const;

export const E05_OPTIMIZATION_VERSION = "e05-optimization-1" as const;
export const E05_OPTIMIZATION_FREEZE_VERSION =
  "e05-optimization-freeze-1" as const;

export const E05_OPTIMIZATION_BASE =
  "enterprise-e05-forecasting-runtime-v1" as const;

export const OPTIMIZATION_OBJECTIVE_KINDS = [
  "maximize",
  "minimize",
  "stabilize",
] as const;

export const OPTIMIZATION_OPTION_ACTIONS = [
  "accelerate",
  "hold",
  "hedge",
  "reprioritize",
] as const;

export const OPTIMIZATION_TRACE_EVENT_KINDS = [
  "ready",
  "forecast",
  "evaluate",
  "recommend",
  "result",
  "error",
] as const;
