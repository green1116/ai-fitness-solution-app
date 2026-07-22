/**
 * Evolution P1 — AI Operations Optimization constants
 * BASE: enterprise-post-launch-operations-complete-v1
 */

export const EVOLUTION_AI_OPS_OPTIMIZATION_ID =
  "enterprise-evolution-p1-ai-operations-optimization-v1" as const;

export const EVOLUTION_AI_OPS_OPTIMIZATION_VERSION = "evolution-p1-1" as const;
export const EVOLUTION_AI_OPS_OPTIMIZATION_FREEZE_VERSION =
  "evolution-ai-ops-optimization-freeze-1" as const;

export const EVOLUTION_AI_OPS_OPTIMIZATION_BASE =
  "enterprise-post-launch-operations-complete-v1" as const;

export const EVOLUTION_P1_AI_OPS_FREEZE_VERSION =
  "evolution-p1-ai-operations-optimization-freeze-1" as const;

export const INTELLIGENCE_SIGNAL_KINDS = [
  "EFFICIENCY",
  "CAPACITY",
  "RELIABILITY",
  "COST",
  "GROWTH",
] as const;

export const EFFICIENCY_BANDS = [
  "EXCELLENT",
  "GOOD",
  "FAIR",
  "POOR",
  "UNKNOWN",
] as const;

export const OPTIMIZATION_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export const IMPROVEMENT_STATUSES = [
  "PROPOSED",
  "ACCEPTED",
  "IN_PROGRESS",
  "COMPLETED",
  "REJECTED",
] as const;

export const EVOLUTION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const EVOLUTION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
