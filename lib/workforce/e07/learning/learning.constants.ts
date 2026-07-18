/**
 * E07-P6 — Workforce Learning Loop constants
 * BASE: enterprise-e07-p5-human-ai-collaboration-v1
 */

export const E07_LEARNING_LOOP_ID =
  "enterprise-e07-workforce-learning-loop-v1" as const;

export const E07_LEARNING_VERSION = "e07-learning-1" as const;
export const E07_LEARNING_FREEZE_VERSION = "e07-learning-freeze-1" as const;

export const E07_LEARNING_BASE =
  "enterprise-e07-p5-human-ai-collaboration-v1" as const;

export const LEARNING_KINDS = [
  "outcome",
  "gate",
  "handoff",
] as const;

/** Loop lifecycle: EVALUATE -> IMPROVE -> UPDATE -> MEASURE */
export const LEARNING_LOOP_PHASES = [
  "EVALUATE",
  "IMPROVE",
  "UPDATE",
  "MEASURE",
] as const;

export const LEARNING_LOOP_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["EVALUATE", "IMPROVE"],
  ["IMPROVE", "UPDATE"],
  ["UPDATE", "MEASURE"],
] as const;

export const LEARNING_TRACE_EVENT_KINDS = [
  "ready",
  "evaluate",
  "improve",
  "update",
  "measure",
  "result",
  "error",
] as const;
