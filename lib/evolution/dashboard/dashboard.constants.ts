/**
 * Evolution P4 — Enterprise Intelligence Dashboard constants
 * BASE: enterprise-evolution-p3-autonomous-customer-success-v1
 */

export const EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_ID =
  "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1" as const;

export const EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_VERSION =
  "evolution-p4-1" as const;
export const EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_FREEZE_VERSION =
  "evolution-enterprise-intelligence-dashboard-freeze-1" as const;

export const EVOLUTION_ENTERPRISE_INTELLIGENCE_DASHBOARD_BASE =
  "enterprise-evolution-p3-autonomous-customer-success-v1" as const;

export const EVOLUTION_P4_DASHBOARD_FREEZE_VERSION =
  "evolution-p4-enterprise-intelligence-dashboard-freeze-1" as const;

export const DASHBOARD_SCOPES = [
  "EXECUTIVE",
  "OPERATIONS",
  "GROWTH",
  "ENTERPRISE",
] as const;

export const EXECUTIVE_TRENDS = [
  "UP",
  "FLAT",
  "DOWN",
  "UNKNOWN",
] as const;

export const CROSS_PLATFORM_DOMAINS = [
  "PREDICTIVE",
  "CUSTOMER",
  "GROWTH",
  "OPERATIONS",
  "CLOUD",
] as const;

export const OPERATIONAL_INSIGHT_KINDS = [
  "HEALTH",
  "RISK",
  "CAPACITY",
  "ENGAGEMENT",
  "DECISION",
] as const;

export const BI_VIEW_MODES = [
  "SUMMARY",
  "DETAIL",
  "COMPARATIVE",
] as const;

export const DASHBOARD_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const DASHBOARD_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
