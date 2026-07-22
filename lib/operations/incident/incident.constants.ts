/**
 * Post-Launch P3 — Incident Response Operations constants
 * BASE: enterprise-post-launch-p2-customer-success-operations-v1
 */

export const OPERATIONS_INCIDENT_RESPONSE_ID =
  "enterprise-post-launch-p3-incident-response-operations-v1" as const;

export const OPERATIONS_INCIDENT_RESPONSE_VERSION = "operations-p3-1" as const;
export const OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION =
  "operations-incident-response-freeze-1" as const;

export const OPERATIONS_INCIDENT_RESPONSE_BASE =
  "enterprise-post-launch-p2-customer-success-operations-v1" as const;

export const OPERATIONS_P3_INCIDENT_RESPONSE_FREEZE_VERSION =
  "operations-p3-incident-response-operations-freeze-1" as const;

export const OPERATIONS_INCIDENT_SEVERITIES = [
  "SEV1",
  "SEV2",
  "SEV3",
  "SEV4",
] as const;

export const OPERATIONS_INCIDENT_STATUSES = [
  "OPEN",
  "ACKNOWLEDGED",
  "ESCALATED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
] as const;

export const INCIDENT_IMPACT_LEVELS = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
] as const;

export const INCIDENT_URGENCY_LEVELS = [
  "IMMEDIATE",
  "HIGH",
  "NORMAL",
  "LOW",
] as const;

export const ESCALATION_WORKFLOW_STEPS = [
  "DETECT",
  "CLASSIFY",
  "TRIAGE",
  "ESCALATE",
  "CONTAIN",
  "RESOLVE",
  "REVIEW",
] as const;

export const ESCALATION_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
] as const;

export const RESOLUTION_OUTCOMES = [
  "FIXED",
  "MITIGATED",
  "WORKAROUND",
  "DUPLICATE",
  "FALSE_POSITIVE",
] as const;

export const INCIDENT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const INCIDENT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
