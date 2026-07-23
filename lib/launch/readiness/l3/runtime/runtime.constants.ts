/**
 * Launch L3 — Production Hardening constants
 * BASE: enterprise-launch-l2-pilot-customer-flow-v1
 * Isolated namespace: lib/launch/readiness/l3
 */

export const LAUNCH_L3_PRODUCTION_HARDENING_ID =
  "enterprise-launch-l3-production-hardening-v1" as const;

export const LAUNCH_L3_PRODUCTION_HARDENING_VERSION = "launch-l3-1" as const;

export const LAUNCH_L3_PRODUCTION_HARDENING_FREEZE_VERSION =
  "launch-l3-production-hardening-freeze-1" as const;

export const LAUNCH_L3_PRODUCTION_HARDENING_BASE =
  "enterprise-launch-l2-pilot-customer-flow-v1" as const;

export const LAUNCH_L3_HARDENING_FREEZE_VERSION =
  "launch-l3-production-hardening-freeze-1" as const;

export const RUNTIME_STATUSES = [
  "BOOTING",
  "HEALTHY",
  "DEGRADED",
  "DOWN",
] as const;

export const HEALTH_LEVELS = [
  "GREEN",
  "YELLOW",
  "ORANGE",
  "RED",
] as const;

export const SECURITY_POLICY_SCOPES = [
  "AUTH",
  "NETWORK",
  "DATA",
  "SECRETS",
] as const;

export const SECURITY_CHECK_RESULTS = [
  "PASS",
  "WARN",
  "FAIL",
] as const;

export const METRIC_KINDS = [
  "LATENCY",
  "ERROR_RATE",
  "THROUGHPUT",
  "SATURATION",
] as const;

export const ALERT_SEVERITIES = [
  "INFO",
  "WARN",
  "CRITICAL",
] as const;

export const AUDIT_EVENT_KINDS = [
  "RUNTIME",
  "SECURITY",
  "MONITORING",
  "BACKUP",
] as const;

export const BACKUP_STATUSES = [
  "CAPTURED",
  "VERIFIED",
  "RESTORED",
  "FAILED",
] as const;

export const L3_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const L3_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
