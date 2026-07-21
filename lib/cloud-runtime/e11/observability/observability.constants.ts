/**
 * E11-P5 — Cloud Runtime Observability Layer constants
 * BASE: enterprise-e11-p4-cloud-runtime-resource-governance-v1
 */

export const E11_OBSERVABILITY_ID =
  "enterprise-e11-cloud-runtime-observability-v1" as const;

export const E11_OBSERVABILITY_VERSION = "e11-observability-1" as const;
export const E11_OBSERVABILITY_FREEZE_VERSION =
  "e11-observability-freeze-1" as const;

export const E11_OBSERVABILITY_BASE =
  "enterprise-e11-p4-cloud-runtime-resource-governance-v1" as const;

export const E11_P5_OBSERVABILITY_FREEZE_VERSION =
  "e11-p5-cloud-runtime-observability-freeze-1" as const;

export const OBSERVABILITY_EVENT_KINDS = [
  "LIFECYCLE",
  "EXECUTION",
  "GOVERNANCE",
  "TENANT",
  "SYSTEM",
  "ANOMALY",
] as const;

export const OBSERVABILITY_EVENT_SEVERITIES = [
  "DEBUG",
  "INFO",
  "WARN",
  "ERROR",
  "CRITICAL",
] as const;

export const TELEMETRY_SIGNAL_TYPES = [
  "COUNTER",
  "GAUGE",
  "HISTOGRAM",
  "TRACE",
] as const;

export const AUDIT_ACTIONS = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "EXECUTE",
  "ALLOCATE",
  "ROUTE",
  "ADMIT",
] as const;

export const ANOMALY_KINDS = [
  "HIGH_UTILIZATION",
  "HEALTH_DEGRADED",
  "EXECUTION_FAILURE_SPIKE",
  "QUOTA_PRESSURE",
  "UNKNOWN",
] as const;

export const OBSERVABILITY_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
