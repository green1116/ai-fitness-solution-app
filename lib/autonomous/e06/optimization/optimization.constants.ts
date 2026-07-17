/**
 * E06-P5 — Self Optimization Loop constants
 * BASE: enterprise-e06-p4-enterprise-control-plane-v1
 */

export const E06_OPTIMIZATION_LOOP_ID =
  "enterprise-e06-self-optimization-loop-v1" as const;

export const E06_OPTIMIZATION_VERSION = "e06-optimization-1" as const;
export const E06_OPTIMIZATION_FREEZE_VERSION =
  "e06-optimization-freeze-1" as const;

export const E06_OPTIMIZATION_BASE =
  "enterprise-e06-p4-enterprise-control-plane-v1" as const;

export const OPTIMIZATION_KINDS = [
  "throughput",
  "resilience",
  "quality",
] as const;

/** Loop lifecycle: EVALUATE -> OPTIMIZE -> APPLY -> MEASURE */
export const OPTIMIZATION_LOOP_PHASES = [
  "EVALUATE",
  "OPTIMIZE",
  "APPLY",
  "MEASURE",
] as const;

export const OPTIMIZATION_LOOP_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["EVALUATE", "OPTIMIZE"],
  ["OPTIMIZE", "APPLY"],
  ["APPLY", "MEASURE"],
] as const;

export const OPTIMIZATION_TRACE_EVENT_KINDS = [
  "ready",
  "evaluate",
  "optimize",
  "apply",
  "measure",
  "result",
  "error",
] as const;
