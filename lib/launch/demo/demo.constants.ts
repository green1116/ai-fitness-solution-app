/**
 * Launch P3 — Demo Environment Layer constants
 * BASE: enterprise-launch-p2-customer-onboarding-v1
 */

export const LAUNCH_DEMO_ENVIRONMENT_ID =
  "enterprise-launch-p3-demo-environment-v1" as const;

export const LAUNCH_DEMO_ENVIRONMENT_VERSION = "launch-p3-1" as const;
export const LAUNCH_DEMO_ENVIRONMENT_FREEZE_VERSION =
  "launch-demo-environment-freeze-1" as const;

export const LAUNCH_DEMO_ENVIRONMENT_BASE =
  "enterprise-launch-p2-customer-onboarding-v1" as const;

export const LAUNCH_P3_DEMO_FREEZE_VERSION =
  "launch-p3-demo-environment-freeze-1" as const;

export const DEMO_TENANT_STATUSES = [
  "PROVISIONING",
  "READY",
  "ACTIVE",
  "RESET",
  "ARCHIVED",
] as const;

export const DEMO_WORKSPACE_STATUSES = [
  "ACTIVE",
  "FROZEN",
  "RESET",
] as const;

export const SAMPLE_DATA_KINDS = [
  "USERS",
  "WORKOUTS",
  "METRICS",
  "BILLING",
  "API_CALLS",
] as const;

export const DEMO_SCENARIO_STEPS = [
  "SEED_SAMPLE_DATA",
  "RUN_WORKFLOW",
  "CAPTURE_SNAPSHOT",
  "VALIDATE_DEMO",
] as const;

export const DEMO_SCENARIO_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
] as const;

export const SNAPSHOT_STATUSES = [
  "CAPTURED",
  "RESTORED",
  "INVALIDATED",
] as const;

export const DEMO_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DEMO_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
