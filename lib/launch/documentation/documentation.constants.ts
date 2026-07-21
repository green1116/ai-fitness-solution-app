/**
 * Launch P6 — Documentation Package Layer constants
 * BASE: enterprise-launch-p5-sla-support-v1
 */

export const LAUNCH_DOCUMENTATION_ID =
  "enterprise-launch-p6-documentation-v1" as const;

export const LAUNCH_DOCUMENTATION_VERSION = "launch-p6-1" as const;
export const LAUNCH_DOCUMENTATION_FREEZE_VERSION =
  "launch-documentation-freeze-1" as const;

export const LAUNCH_DOCUMENTATION_BASE =
  "enterprise-launch-p5-sla-support-v1" as const;

export const LAUNCH_P6_DOCUMENTATION_FREEZE_VERSION =
  "launch-p6-documentation-freeze-1" as const;

export const DOCUMENTATION_PACKAGE_STATUSES = [
  "DRAFT",
  "IN_REVIEW",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export const DOCUMENT_STATUSES = [
  "DRAFT",
  "REVIEW",
  "PUBLISHED",
  "DEPRECATED",
] as const;

export const API_DOC_SECTIONS = [
  "OVERVIEW",
  "AUTHENTICATION",
  "ENDPOINTS",
  "ERRORS",
  "EXAMPLES",
] as const;

export const DEPLOYMENT_DOC_SECTIONS = [
  "PREREQUISITES",
  "INSTALLATION",
  "CONFIGURATION",
  "VALIDATION",
  "ROLLBACK",
] as const;

export const CUSTOMER_GUIDE_SECTIONS = [
  "GETTING_STARTED",
  "WORKSPACES",
  "BILLING",
  "SUPPORT",
  "SECURITY",
] as const;

export const HANDBOOK_SECTIONS = [
  "RUNBOOKS",
  "MONITORING",
  "INCIDENT_RESPONSE",
  "ESCALATION",
  "CHANGE_MANAGEMENT",
] as const;

export const DOCUMENTATION_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DOCUMENTATION_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
