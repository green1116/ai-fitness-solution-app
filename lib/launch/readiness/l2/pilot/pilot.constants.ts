/**
 * Launch L2 — Pilot Customer Flow constants
 * BASE: enterprise-launch-l1-demo-foundation-v1
 * Isolated namespace: lib/launch/readiness/l2
 */

export const LAUNCH_L2_PILOT_CUSTOMER_FLOW_ID =
  "enterprise-launch-l2-pilot-customer-flow-v1" as const;

export const LAUNCH_L2_PILOT_CUSTOMER_FLOW_VERSION = "launch-l2-1" as const;

export const LAUNCH_L2_PILOT_CUSTOMER_FLOW_FREEZE_VERSION =
  "launch-l2-pilot-customer-flow-freeze-1" as const;

export const LAUNCH_L2_PILOT_CUSTOMER_FLOW_BASE =
  "enterprise-launch-l1-demo-foundation-v1" as const;

export const LAUNCH_L2_PILOT_FREEZE_VERSION =
  "launch-l2-pilot-customer-flow-freeze-1" as const;

export const PILOT_STATUSES = [
  "DRAFT",
  "INTAKE",
  "ACTIVE",
  "ACCEPTED",
  "CLOSED",
] as const;

export const INTAKE_STATUSES = [
  "OPEN",
  "SUBMITTED",
  "REVIEWED",
  "APPROVED",
  "REJECTED",
] as const;

export const PROJECT_LIFECYCLE_STAGES = [
  "KICKOFF",
  "BUILD",
  "VALIDATE",
  "HANDOFF",
  "COMPLETE",
] as const;

export const FEEDBACK_CHANNELS = [
  "SURVEY",
  "INTERVIEW",
  "SUPPORT",
  "NPS",
] as const;

export const DELIVERY_CHECKPOINT_KINDS = [
  "KICKOFF",
  "MIDPOINT",
  "UAT",
  "GO_LIVE",
] as const;

export const ACCEPTANCE_VERDICTS = [
  "PENDING",
  "ACCEPTED",
  "REJECTED",
  "CONDITIONAL",
] as const;

export const L2_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const L2_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
