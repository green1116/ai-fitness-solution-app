/**
 * PL-2.1 — Service Monitoring Core types.
 * In-memory monitoring only — no IO / persistence / providers.
 */

export const SERVICE_MONITORING_ID = "pl-2.1-service-monitoring-v1" as const;

export const SERVICE_HEALTH_STATUSES = [
  "healthy",
  "degraded",
  "unhealthy",
  "unknown",
] as const;

export type ServiceHealthStatus = (typeof SERVICE_HEALTH_STATUSES)[number];

export const SERVICE_AVAILABILITY_STATES = [
  "available",
  "partial",
  "unavailable",
] as const;

export type ServiceAvailabilityState =
  (typeof SERVICE_AVAILABILITY_STATES)[number];

export const MONITORING_ALERT_SEVERITIES = [
  "info",
  "warning",
  "critical",
] as const;

export type MonitoringAlertSeverity =
  (typeof MONITORING_ALERT_SEVERITIES)[number];

/** Deterministic monitoring policy thresholds. */
export type MonitoringPolicy = Readonly<{
  /** Availability below this percent is unavailable (0–100). */
  unavailableBelowPercent: number;
  /** Availability below this percent (but above unavailable) is partial. */
  partialBelowPercent: number;
  /** Error rate at or above this value marks unhealthy (0–1). */
  unhealthyErrorRate: number;
  /** Latency at or above this ms marks degraded when otherwise healthy. */
  degradedLatencyMs: number;
  /** Maximum retained active alerts (oldest dropped when exceeded). */
  maxActiveAlerts: number;
}>;

export const DEFAULT_MONITORING_POLICY: MonitoringPolicy = {
  unavailableBelowPercent: 50,
  partialBelowPercent: 99,
  unhealthyErrorRate: 0.05,
  degradedLatencyMs: 1000,
  maxActiveAlerts: 100,
};

export type ServiceHealthRecord = Readonly<{
  serviceId: string;
  name: string;
  health: ServiceHealthStatus;
  availability: ServiceAvailabilityState;
  availabilityPercent: number;
  updatedAt: number;
}>;

export type RegisterServiceInput = Readonly<{
  serviceId: string;
  name: string;
}>;

export type ReportHealthInput = Readonly<{
  serviceId: string;
  health?: ServiceHealthStatus;
  availabilityPercent?: number;
  latencyMs?: number;
  errorRate?: number;
  requestCount?: number;
}>;

export type MonitoringAlert = Readonly<{
  alertId: string;
  serviceId: string;
  severity: MonitoringAlertSeverity;
  message: string;
  active: boolean;
  raisedAt: number;
  resolvedAt?: number;
}>;

export type RaiseAlertInput = Readonly<{
  serviceId: string;
  severity: MonitoringAlertSeverity;
  message: string;
  /** Optional stable id — when omitted, manager assigns sequential id. */
  alertId?: string;
}>;

export type MetricSample = Readonly<{
  serviceId: string;
  latencyMs: number;
  errorRate: number;
  requestCount: number;
  recordedAt: number;
}>;

export type RecordMetricsInput = Readonly<{
  serviceId: string;
  latencyMs: number;
  errorRate: number;
  requestCount: number;
}>;

export type MetricsSnapshot = Readonly<{
  at: number;
  serviceCount: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  unknownCount: number;
  activeAlertCount: number;
  averageAvailabilityPercent: number;
  policy: MonitoringPolicy;
  services: readonly ServiceHealthRecord[];
  alerts: readonly MonitoringAlert[];
  metrics: readonly MetricSample[];
}>;

export type ServiceMonitoringManagerStatus = "idle" | "running" | "stopped";

export type ServiceMonitoringManagerSnapshot = Readonly<{
  managerId: string;
  layerId: typeof SERVICE_MONITORING_ID;
  status: ServiceMonitoringManagerStatus;
  clock: number;
  serviceCount: number;
  activeAlertCount: number;
  metricCount: number;
}>;
