/**
 * Operations O3 — Support Operations constants
 * BASE: enterprise-operations-o2-usage-intelligence-foundation-v1
 * Isolated namespace: lib/operations/o3
 */

export const OPERATIONS_O3_SUPPORT_OPERATIONS_ID =
  "enterprise-operations-o3-support-operations-v1" as const;

export const OPERATIONS_O3_SUPPORT_OPERATIONS_VERSION =
  "operations-o3-1" as const;

export const OPERATIONS_O3_SUPPORT_OPERATIONS_FREEZE_VERSION =
  "operations-o3-support-operations-freeze-1" as const;

export const OPERATIONS_O3_SUPPORT_OPERATIONS_BASE =
  "enterprise-operations-o2-usage-intelligence-foundation-v1" as const;

export const OPERATIONS_O3_SUPPORT_FREEZE_VERSION =
  "operations-o3-support-operations-freeze-1" as const;

export const TICKET_PRIORITIES = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const TICKET_STATUSES = [
  "OPEN",
  "IN_PROGRESS",
  "WAITING",
  "RESOLVED",
  "CLOSED",
] as const;

export const SUPPORT_WORKFLOW_STAGES = [
  "TRIAGE",
  "ASSIGN",
  "INVESTIGATE",
  "RESOLVE",
  "CLOSE",
] as const;

export const KNOWLEDGE_CATEGORIES = [
  "HOWTO",
  "TROUBLESHOOT",
  "POLICY",
  "FAQ",
] as const;

export const SLA_TARGETS = [
  "FIRST_RESPONSE",
  "RESOLUTION",
  "ESCALATION",
] as const;

export const RESOLUTION_OUTCOMES = [
  "FIXED",
  "WORKAROUND",
  "DUPLICATE",
  "WONT_FIX",
] as const;

export const O3_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const O3_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
