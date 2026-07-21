/**
 * Launch P5 — SLA Support Package Layer constants
 * BASE: enterprise-launch-p4-security-readiness-v1
 */

export const LAUNCH_SLA_SUPPORT_ID =
  "enterprise-launch-p5-sla-support-v1" as const;

export const LAUNCH_SLA_SUPPORT_VERSION = "launch-p5-1" as const;
export const LAUNCH_SLA_SUPPORT_FREEZE_VERSION =
  "launch-sla-support-freeze-1" as const;

export const LAUNCH_SLA_SUPPORT_BASE =
  "enterprise-launch-p4-security-readiness-v1" as const;

export const LAUNCH_P5_SUPPORT_FREEZE_VERSION =
  "launch-p5-sla-support-freeze-1" as const;

export const SUPPORT_SLA_PROFILE_STATUSES = [
  "DRAFT",
  "ACTIVE",
  "SUSPENDED",
  "EXPIRED",
  "ARCHIVED",
] as const;

export const SUPPORT_TIERS = [
  "BASIC",
  "STANDARD",
  "PREMIUM",
  "ENTERPRISE",
] as const;

export const INCIDENT_SEVERITIES = [
  "SEV1",
  "SEV2",
  "SEV3",
  "SEV4",
] as const;

export const INCIDENT_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const INCIDENT_WORKFLOW_STEPS = [
  "OPEN",
  "ACKNOWLEDGE",
  "INVESTIGATE",
  "RESOLVE",
  "CLOSE",
] as const;

export const SUPPORT_POLICY_KINDS = [
  "RESPONSE_TIME",
  "RESOLUTION_TIME",
  "ESCALATION",
  "COVERAGE_WINDOW",
] as const;

export const SUPPORT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const SUPPORT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;

/** Default response minutes by support tier. */
export const SUPPORT_TIER_RESPONSE_MINUTES = {
  BASIC: 1440,
  STANDARD: 480,
  PREMIUM: 120,
  ENTERPRISE: 30,
} as const;
