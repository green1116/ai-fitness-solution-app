/**
 * Launch L1 — Demo Foundation constants
 * BASE: enterprise-commercialization-v1-release
 * Isolated namespace: lib/launch/readiness/l1
 */

export const LAUNCH_L1_DEMO_FOUNDATION_ID =
  "enterprise-launch-l1-demo-foundation-v1" as const;

export const LAUNCH_L1_DEMO_FOUNDATION_VERSION = "launch-l1-1" as const;

export const LAUNCH_L1_DEMO_FOUNDATION_FREEZE_VERSION =
  "launch-l1-demo-foundation-freeze-1" as const;

export const LAUNCH_L1_DEMO_FOUNDATION_BASE =
  "enterprise-commercialization-v1-release" as const;

export const LAUNCH_L1_DEMO_FREEZE_VERSION =
  "launch-l1-demo-foundation-freeze-1" as const;

export const TENANT_STATUSES = [
  "PROVISIONING",
  "READY",
  "ACTIVE",
  "SUSPENDED",
] as const;

export const CUSTOMER_SEGMENTS = [
  "ENTERPRISE",
  "MID_MARKET",
  "SMB",
  "PARTNER",
] as const;

export const PROJECT_SCENARIO_KINDS = [
  "ONBOARDING",
  "WORKOUT",
  "BILLING",
  "ANALYTICS",
] as const;

export const ARTIFACT_KINDS = [
  "DATASET",
  "CONFIG",
  "SNAPSHOT",
  "REPORT",
] as const;

export const DEMO_LOAD_STATUSES = [
  "PENDING",
  "LOADED",
  "FAILED",
] as const;

export const L1_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const L1_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
