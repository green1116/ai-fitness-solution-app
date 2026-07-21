/**
 * Launch P7 — Launch Control Plane constants
 * BASE: enterprise-launch-p6-documentation-v1
 */

export const LAUNCH_CONTROL_PLANE_ID =
  "enterprise-launch-p7-launch-control-plane-v1" as const;

export const LAUNCH_CONTROL_PLANE_VERSION = "launch-p7-1" as const;
export const LAUNCH_CONTROL_PLANE_FREEZE_VERSION =
  "launch-control-plane-freeze-1" as const;

export const LAUNCH_CONTROL_PLANE_BASE =
  "enterprise-launch-p6-documentation-v1" as const;

export const LAUNCH_P7_CONTROL_FREEZE_VERSION =
  "launch-p7-launch-control-plane-freeze-1" as const;

export const ORCHESTRATION_STATUSES = [
  "DRAFT",
  "PLANNED",
  "IN_PROGRESS",
  "COMPLETED",
  "ABORTED",
] as const;

export const ORCHESTRATION_STAGES = [
  "PRODUCTION",
  "ONBOARDING",
  "DEMO",
  "SECURITY",
  "SLA",
  "DOCUMENTATION",
  "GO_LIVE",
] as const;

export const RELEASE_DECISION_VERDICTS = [
  "APPROVE",
  "CONDITIONAL",
  "REJECT",
  "DEFER",
] as const;

export const GONGO_VERDICTS = ["GO", "NO_GO", "HOLD"] as const;

export const DEPLOYMENT_AGG_STATUSES = [
  "UNKNOWN",
  "PENDING",
  "READY",
  "LIVE",
  "DEGRADED",
  "FAILED",
] as const;

export const CONTROL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const CONTROL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
