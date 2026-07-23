/**
 * Operations O2 — Usage Intelligence Foundation constants
 * BASE: enterprise-operations-o1-customer-success-foundation-v1
 * Isolated namespace: lib/operations/o2
 */

export const OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID =
  "enterprise-operations-o2-usage-intelligence-foundation-v1" as const;

export const OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION =
  "operations-o2-1" as const;

export const OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION =
  "operations-o2-usage-intelligence-foundation-freeze-1" as const;

export const OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE =
  "enterprise-operations-o1-customer-success-foundation-v1" as const;

export const OPERATIONS_O2_USAGE_FREEZE_VERSION =
  "operations-o2-usage-intelligence-foundation-freeze-1" as const;

export const USAGE_STREAM_KINDS = [
  "SESSION",
  "API",
  "WORKOUT",
  "BILLING",
] as const;

export const FEATURE_ADOPTION_LEVELS = [
  "NONE",
  "TRIAL",
  "ACTIVE",
  "POWER",
] as const;

export const ACTIVITY_EVENT_KINDS = [
  "LOGIN",
  "FEATURE_USE",
  "EXPORT",
  "ADMIN",
] as const;

export const VALUE_BANDS = [
  "HIGH",
  "MEDIUM",
  "LOW",
  "DORMANT",
] as const;

export const REPORT_KINDS = [
  "EXECUTIVE",
  "PRODUCT",
  "CUSTOMER",
  "TREND",
] as const;

export const O2_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const O2_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
