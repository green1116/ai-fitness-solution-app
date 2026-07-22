/**
 * Evolution P3 — Autonomous Customer Success constants
 * BASE: enterprise-evolution-p2-predictive-intelligence-v1
 */

export const EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_ID =
  "enterprise-evolution-p3-autonomous-customer-success-v1" as const;

export const EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_VERSION =
  "evolution-p3-1" as const;
export const EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_FREEZE_VERSION =
  "evolution-autonomous-customer-success-freeze-1" as const;

export const EVOLUTION_AUTONOMOUS_CUSTOMER_SUCCESS_BASE =
  "enterprise-evolution-p2-predictive-intelligence-v1" as const;

export const EVOLUTION_P3_CUSTOMER_FREEZE_VERSION =
  "evolution-p3-autonomous-customer-success-freeze-1" as const;

export const CUSTOMER_INTELLIGENCE_MODES = [
  "OBSERVE",
  "ASSIST",
  "AUTONOMOUS",
] as const;

export const ENGAGEMENT_CHANNELS = [
  "IN_APP",
  "EMAIL",
  "CSM",
  "PLAYBOOK",
] as const;

export const ENGAGEMENT_STATUSES = [
  "QUEUED",
  "RUNNING",
  "COMPLETED",
  "SKIPPED",
] as const;

export const SUCCESS_RECOMMENDATION_KINDS = [
  "ADOPTION",
  "RETENTION",
  "EXPANSION",
  "SUPPORT",
] as const;

export const CHURN_THREAT_LEVELS = [
  "NONE",
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const EXPANSION_OPPORTUNITY_LEVELS = [
  "NONE",
  "EMERGING",
  "READY",
  "HOT",
  "UNKNOWN",
] as const;

export const AUTONOMOUS_CS_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const AUTONOMOUS_CS_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
