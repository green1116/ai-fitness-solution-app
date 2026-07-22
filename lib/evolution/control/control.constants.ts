/**
 * Evolution P7 — Evolution Control Plane constants
 * BASE: enterprise-evolution-p6-marketplace-ecosystem-v1
 */

export const EVOLUTION_CONTROL_PLANE_ID =
  "enterprise-evolution-p7-evolution-control-plane-v1" as const;

export const EVOLUTION_CONTROL_PLANE_VERSION = "evolution-p7-1" as const;
export const EVOLUTION_CONTROL_PLANE_FREEZE_VERSION =
  "evolution-control-plane-freeze-1" as const;

export const EVOLUTION_CONTROL_PLANE_BASE =
  "enterprise-evolution-p6-marketplace-ecosystem-v1" as const;

export const EVOLUTION_P7_CONTROL_FREEZE_VERSION =
  "evolution-p7-evolution-control-plane-freeze-1" as const;

export const EVO_ORCHESTRATION_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "DEGRADED",
  "PAUSED",
  "COMPLETED",
] as const;

export const EVO_ORCHESTRATION_DOMAINS = [
  "OPTIMIZATION",
  "PREDICTIVE",
  "CUSTOMER",
  "DASHBOARD",
  "GLOBAL",
  "MARKETPLACE",
] as const;

export const EVO_COMMAND_MODES = [
  "MONITOR",
  "IMPROVE",
  "STEADY",
  "LOCKDOWN",
] as const;

export const EVO_LOOP_STATUSES = [
  "IDLE",
  "RUNNING",
  "CONVERGED",
  "BLOCKED",
] as const;

export const EVO_DECISION_VERDICTS = [
  "ADVANCE",
  "HOLD",
  "ROLLBACK",
  "ESCALATE",
] as const;

export const EVO_CONTROL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const EVO_CONTROL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
