/**
 * Post-Launch P6 — Enterprise Support Operations constants
 * BASE: enterprise-post-launch-p5-growth-analytics-operations-v1
 */

export const OPERATIONS_ENTERPRISE_SUPPORT_ID =
  "enterprise-post-launch-p6-enterprise-support-operations-v1" as const;

export const OPERATIONS_ENTERPRISE_SUPPORT_VERSION = "operations-p6-1" as const;
export const OPERATIONS_ENTERPRISE_SUPPORT_FREEZE_VERSION =
  "operations-enterprise-support-freeze-1" as const;

export const OPERATIONS_ENTERPRISE_SUPPORT_BASE =
  "enterprise-post-launch-p5-growth-analytics-operations-v1" as const;

export const OPERATIONS_P6_ENTERPRISE_SUPPORT_FREEZE_VERSION =
  "operations-p6-enterprise-support-operations-freeze-1" as const;

export const SUPPORT_CASE_PRIORITIES = [
  "P1",
  "P2",
  "P3",
  "P4",
] as const;

export const SUPPORT_CASE_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
] as const;

export const SUPPORT_WORKFLOW_STEPS = [
  "INTAKE",
  "TRIAGE",
  "INVESTIGATE",
  "RESPOND",
  "RESOLVE",
  "CLOSE",
] as const;

export const SUPPORT_STEP_STATUSES = [
  "PENDING",
  "RUNNING",
  "COMPLETED",
  "FAILED",
  "SKIPPED",
] as const;

export const ESCALATION_ROUTES = [
  "L1_SUPPORT",
  "L2_SUPPORT",
  "L3_ENGINEERING",
  "INCIDENT_RESPONSE",
  "CUSTOMER_SUCCESS",
] as const;

export const KNOWLEDGE_ARTICLE_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const ENTERPRISE_SUPPORT_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ENTERPRISE_SUPPORT_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
