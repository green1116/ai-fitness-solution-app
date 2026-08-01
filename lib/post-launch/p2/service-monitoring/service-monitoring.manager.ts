/**
 * PL-2.1 — Service Monitoring Manager.
 * Minimal deterministic in-memory core — no IO / timers / providers.
 */

import {
  DEFAULT_MONITORING_POLICY,
  MONITORING_ALERT_SEVERITIES,
  SERVICE_AVAILABILITY_STATES,
  SERVICE_HEALTH_STATUSES,
  SERVICE_MONITORING_ID,
  type MetricSample,
  type MetricsSnapshot,
  type MonitoringAlert,
  type MonitoringAlertSeverity,
  type MonitoringPolicy,
  type RaiseAlertInput,
  type RecordMetricsInput,
  type RegisterServiceInput,
  type ReportHealthInput,
  type ServiceAvailabilityState,
  type ServiceHealthRecord,
  type ServiceHealthStatus,
  type ServiceMonitoringManagerSnapshot,
  type ServiceMonitoringManagerStatus,
} from "./service-monitoring.types";

function assertFinite(name: string, value: number): void {
  if (!Number.isFinite(value)) {
    throw new Error(`${name} must be a finite number`);
  }
}

function assertPercent(name: string, value: number): void {
  assertFinite(name, value);
  if (value < 0 || value > 100) {
    throw new Error(`${name} must be between 0 and 100`);
  }
}

function assertUnitInterval(name: string, value: number): void {
  assertFinite(name, value);
  if (value < 0 || value > 1) {
    throw new Error(`${name} must be between 0 and 1`);
  }
}

function isHealthStatus(value: string): value is ServiceHealthStatus {
  return (SERVICE_HEALTH_STATUSES as readonly string[]).includes(value);
}

function isAlertSeverity(value: string): value is MonitoringAlertSeverity {
  return (MONITORING_ALERT_SEVERITIES as readonly string[]).includes(value);
}

function availabilityFromPercent(
  percent: number,
  policy: MonitoringPolicy,
): ServiceAvailabilityState {
  if (percent < policy.unavailableBelowPercent) return "unavailable";
  if (percent < policy.partialBelowPercent) return "partial";
  return "available";
}

function deriveHealth(input: {
  explicit?: ServiceHealthStatus;
  availabilityPercent: number;
  latencyMs?: number;
  errorRate?: number;
  policy: MonitoringPolicy;
}): ServiceHealthStatus {
  if (input.explicit) return input.explicit;

  if (
    input.errorRate !== undefined &&
    input.errorRate >= input.policy.unhealthyErrorRate
  ) {
    return "unhealthy";
  }

  if (input.availabilityPercent < input.policy.unavailableBelowPercent) {
    return "unhealthy";
  }

  if (
    input.availabilityPercent < input.policy.partialBelowPercent ||
    (input.latencyMs !== undefined &&
      input.latencyMs >= input.policy.degradedLatencyMs)
  ) {
    return "degraded";
  }

  return "healthy";
}

function cloneService(record: ServiceHealthRecord): ServiceHealthRecord {
  return { ...record };
}

function cloneAlert(alert: MonitoringAlert): MonitoringAlert {
  return { ...alert };
}

function cloneMetric(sample: MetricSample): MetricSample {
  return { ...sample };
}

function clonePolicy(policy: MonitoringPolicy): MonitoringPolicy {
  return { ...policy };
}

export type ServiceMonitoringManager = {
  readonly layerId: typeof SERVICE_MONITORING_ID;
  start: () => ServiceMonitoringManagerSnapshot;
  stop: () => ServiceMonitoringManagerSnapshot;
  status: () => ServiceMonitoringManagerSnapshot;
  getPolicy: () => MonitoringPolicy;
  setPolicy: (policy: MonitoringPolicy) => MonitoringPolicy;
  registerService: (input: RegisterServiceInput) => ServiceHealthRecord;
  getService: (serviceId: string) => ServiceHealthRecord | undefined;
  listServices: () => ServiceHealthRecord[];
  reportHealth: (input: ReportHealthInput) => ServiceHealthRecord;
  setAvailability: (
    serviceId: string,
    availabilityPercent: number,
  ) => ServiceHealthRecord;
  raiseAlert: (input: RaiseAlertInput) => MonitoringAlert;
  resolveAlert: (alertId: string) => MonitoringAlert;
  listAlerts: (filter?: {
    serviceId?: string;
    active?: boolean;
    severity?: MonitoringAlertSeverity;
  }) => MonitoringAlert[];
  recordMetrics: (input: RecordMetricsInput) => MetricSample;
  listMetrics: (serviceId?: string) => MetricSample[];
  snapshot: () => MetricsSnapshot;
  reset: () => void;
};

/**
 * Create a deterministic in-memory service monitoring manager.
 * Logical clock + sequential ids — no wall clock / RNG / timers.
 */
export function createServiceMonitoringManager(
  managerId = "svc-mon-1",
): ServiceMonitoringManager {
  let statusState: ServiceMonitoringManagerStatus = "idle";
  let clock = 0;
  let seq = 0;
  let policy: MonitoringPolicy = clonePolicy(DEFAULT_MONITORING_POLICY);

  const services = new Map<string, ServiceHealthRecord>();
  const alerts = new Map<string, MonitoringAlert>();
  const metrics: MetricSample[] = [];

  function tick(): number {
    clock += 1;
    return clock;
  }

  function nextId(prefix: string): string {
    seq += 1;
    return `${prefix}-${seq}`;
  }

  function snapshotStatus(): ServiceMonitoringManagerSnapshot {
    let activeAlertCount = 0;
    for (const alert of alerts.values()) {
      if (alert.active) activeAlertCount += 1;
    }
    return {
      managerId,
      layerId: SERVICE_MONITORING_ID,
      status: statusState,
      clock,
      serviceCount: services.size,
      activeAlertCount,
      metricCount: metrics.length,
    };
  }

  function requireRunning(): void {
    if (statusState !== "running") {
      throw new Error(`service monitoring manager is not running: ${statusState}`);
    }
  }

  function requireService(serviceId: string): ServiceHealthRecord {
    const id = serviceId.trim();
    const record = services.get(id);
    if (!record) throw new Error(`service not found: ${id}`);
    return record;
  }

  function trimActiveAlerts(): void {
    const active = [...alerts.values()]
      .filter((a) => a.active)
      .sort((a, b) => a.raisedAt - b.raisedAt || a.alertId.localeCompare(b.alertId));
    while (active.length > policy.maxActiveAlerts) {
      const oldest = active.shift();
      if (!oldest) break;
      alerts.set(oldest.alertId, {
        ...oldest,
        active: false,
        resolvedAt: clock,
      });
    }
  }

  return {
    layerId: SERVICE_MONITORING_ID,

    start(): ServiceMonitoringManagerSnapshot {
      if (statusState === "running") {
        throw new Error("service monitoring manager already running");
      }
      statusState = "running";
      tick();
      return snapshotStatus();
    },

    stop(): ServiceMonitoringManagerSnapshot {
      if (statusState !== "running") {
        throw new Error(`service monitoring manager cannot stop from: ${statusState}`);
      }
      statusState = "stopped";
      tick();
      return snapshotStatus();
    },

    status(): ServiceMonitoringManagerSnapshot {
      return snapshotStatus();
    },

    getPolicy(): MonitoringPolicy {
      return clonePolicy(policy);
    },

    setPolicy(next: MonitoringPolicy): MonitoringPolicy {
      requireRunning();
      assertPercent("unavailableBelowPercent", next.unavailableBelowPercent);
      assertPercent("partialBelowPercent", next.partialBelowPercent);
      if (next.unavailableBelowPercent > next.partialBelowPercent) {
        throw new Error(
          "unavailableBelowPercent must be <= partialBelowPercent",
        );
      }
      assertUnitInterval("unhealthyErrorRate", next.unhealthyErrorRate);
      assertFinite("degradedLatencyMs", next.degradedLatencyMs);
      if (next.degradedLatencyMs < 0) {
        throw new Error("degradedLatencyMs must be >= 0");
      }
      assertFinite("maxActiveAlerts", next.maxActiveAlerts);
      if (!Number.isInteger(next.maxActiveAlerts) || next.maxActiveAlerts < 1) {
        throw new Error("maxActiveAlerts must be an integer >= 1");
      }
      policy = clonePolicy(next);
      tick();
      trimActiveAlerts();
      return clonePolicy(policy);
    },

    registerService(input: RegisterServiceInput): ServiceHealthRecord {
      requireRunning();
      const serviceId = input.serviceId.trim();
      const name = input.name.trim();
      if (!serviceId) throw new Error("serviceId is required");
      if (!name) throw new Error("name is required");
      if (services.has(serviceId)) {
        throw new Error(`service already registered: ${serviceId}`);
      }
      const at = tick();
      const record: ServiceHealthRecord = {
        serviceId,
        name,
        health: "unknown",
        availability: "unavailable",
        availabilityPercent: 0,
        updatedAt: at,
      };
      services.set(serviceId, record);
      return cloneService(record);
    },

    getService(serviceId: string): ServiceHealthRecord | undefined {
      const record = services.get(serviceId.trim());
      return record ? cloneService(record) : undefined;
    },

    listServices(): ServiceHealthRecord[] {
      return [...services.values()]
        .sort((a, b) => a.serviceId.localeCompare(b.serviceId))
        .map(cloneService);
    },

    reportHealth(input: ReportHealthInput): ServiceHealthRecord {
      requireRunning();
      const current = requireService(input.serviceId);
      if (input.health !== undefined && !isHealthStatus(input.health)) {
        throw new Error(`invalid health status: ${input.health}`);
      }
      if (input.availabilityPercent !== undefined) {
        assertPercent("availabilityPercent", input.availabilityPercent);
      }
      if (input.latencyMs !== undefined) {
        assertFinite("latencyMs", input.latencyMs);
        if (input.latencyMs < 0) throw new Error("latencyMs must be >= 0");
      }
      if (input.errorRate !== undefined) {
        assertUnitInterval("errorRate", input.errorRate);
      }
      if (input.requestCount !== undefined) {
        assertFinite("requestCount", input.requestCount);
        if (
          !Number.isInteger(input.requestCount) ||
          input.requestCount < 0
        ) {
          throw new Error("requestCount must be an integer >= 0");
        }
      }

      const availabilityPercent =
        input.availabilityPercent ?? current.availabilityPercent;
      const health = deriveHealth({
        explicit: input.health,
        availabilityPercent,
        latencyMs: input.latencyMs,
        errorRate: input.errorRate,
        policy,
      });
      const availability = availabilityFromPercent(availabilityPercent, policy);
      const at = tick();

      if (
        input.latencyMs !== undefined ||
        input.errorRate !== undefined ||
        input.requestCount !== undefined
      ) {
        metrics.push({
          serviceId: current.serviceId,
          latencyMs: input.latencyMs ?? 0,
          errorRate: input.errorRate ?? 0,
          requestCount: input.requestCount ?? 0,
          recordedAt: at,
        });
      }

      const next: ServiceHealthRecord = {
        ...current,
        health,
        availability,
        availabilityPercent,
        updatedAt: at,
      };
      services.set(current.serviceId, next);
      return cloneService(next);
    },

    setAvailability(
      serviceId: string,
      availabilityPercent: number,
    ): ServiceHealthRecord {
      return this.reportHealth({ serviceId, availabilityPercent });
    },

    raiseAlert(input: RaiseAlertInput): MonitoringAlert {
      requireRunning();
      const service = requireService(input.serviceId);
      const message = input.message.trim();
      if (!message) throw new Error("message is required");
      if (!isAlertSeverity(input.severity)) {
        throw new Error(`invalid alert severity: ${input.severity}`);
      }
      const alertId = (input.alertId ?? "").trim() || nextId("alert");
      if (alerts.has(alertId)) {
        throw new Error(`alert already exists: ${alertId}`);
      }
      const at = tick();
      const alert: MonitoringAlert = {
        alertId,
        serviceId: service.serviceId,
        severity: input.severity,
        message,
        active: true,
        raisedAt: at,
      };
      alerts.set(alertId, alert);
      trimActiveAlerts();
      return cloneAlert(alerts.get(alertId)!);
    },

    resolveAlert(alertId: string): MonitoringAlert {
      requireRunning();
      const id = alertId.trim();
      const alert = alerts.get(id);
      if (!alert) throw new Error(`alert not found: ${id}`);
      if (!alert.active) throw new Error(`alert already resolved: ${id}`);
      const at = tick();
      const next: MonitoringAlert = {
        ...alert,
        active: false,
        resolvedAt: at,
      };
      alerts.set(id, next);
      return cloneAlert(next);
    },

    listAlerts(filter?: {
      serviceId?: string;
      active?: boolean;
      severity?: MonitoringAlertSeverity;
    }): MonitoringAlert[] {
      let result = [...alerts.values()];
      if (filter?.serviceId) {
        const sid = filter.serviceId.trim();
        result = result.filter((a) => a.serviceId === sid);
      }
      if (filter?.active !== undefined) {
        result = result.filter((a) => a.active === filter.active);
      }
      if (filter?.severity) {
        result = result.filter((a) => a.severity === filter.severity);
      }
      return result
        .sort(
          (a, b) =>
            a.raisedAt - b.raisedAt || a.alertId.localeCompare(b.alertId),
        )
        .map(cloneAlert);
    },

    recordMetrics(input: RecordMetricsInput): MetricSample {
      requireRunning();
      const service = requireService(input.serviceId);
      assertFinite("latencyMs", input.latencyMs);
      if (input.latencyMs < 0) throw new Error("latencyMs must be >= 0");
      assertUnitInterval("errorRate", input.errorRate);
      assertFinite("requestCount", input.requestCount);
      if (
        !Number.isInteger(input.requestCount) ||
        input.requestCount < 0
      ) {
        throw new Error("requestCount must be an integer >= 0");
      }
      const at = tick();
      const sample: MetricSample = {
        serviceId: service.serviceId,
        latencyMs: input.latencyMs,
        errorRate: input.errorRate,
        requestCount: input.requestCount,
        recordedAt: at,
      };
      metrics.push(sample);

      const health = deriveHealth({
        availabilityPercent: service.availabilityPercent,
        latencyMs: input.latencyMs,
        errorRate: input.errorRate,
        policy,
      });
      services.set(service.serviceId, {
        ...service,
        health,
        availability: availabilityFromPercent(
          service.availabilityPercent,
          policy,
        ),
        updatedAt: at,
      });

      return cloneMetric(sample);
    },

    listMetrics(serviceId?: string): MetricSample[] {
      let result = metrics.slice();
      if (serviceId) {
        const sid = serviceId.trim();
        result = result.filter((m) => m.serviceId === sid);
      }
      return result
        .sort(
          (a, b) =>
            a.recordedAt - b.recordedAt ||
            a.serviceId.localeCompare(b.serviceId),
        )
        .map(cloneMetric);
    },

    snapshot(): MetricsSnapshot {
      const serviceList = this.listServices();
      let healthyCount = 0;
      let degradedCount = 0;
      let unhealthyCount = 0;
      let unknownCount = 0;
      let availabilitySum = 0;
      for (const service of serviceList) {
        availabilitySum += service.availabilityPercent;
        if (service.health === "healthy") healthyCount += 1;
        else if (service.health === "degraded") degradedCount += 1;
        else if (service.health === "unhealthy") unhealthyCount += 1;
        else unknownCount += 1;
      }
      const activeAlerts = this.listAlerts({ active: true });
      return {
        at: clock,
        serviceCount: serviceList.length,
        healthyCount,
        degradedCount,
        unhealthyCount,
        unknownCount,
        activeAlertCount: activeAlerts.length,
        averageAvailabilityPercent:
          serviceList.length === 0
            ? 0
            : availabilitySum / serviceList.length,
        policy: clonePolicy(policy),
        services: serviceList,
        alerts: this.listAlerts(),
        metrics: this.listMetrics(),
      };
    },

    reset(): void {
      statusState = "idle";
      clock = 0;
      seq = 0;
      policy = clonePolicy(DEFAULT_MONITORING_POLICY);
      services.clear();
      alerts.clear();
      metrics.length = 0;
    },
  };
}

/** @internal exhaustiveness helpers for verify / consumers */
export const SERVICE_MONITORING_PUBLIC_ENUMS = {
  health: SERVICE_HEALTH_STATUSES,
  availability: SERVICE_AVAILABILITY_STATES,
  severity: MONITORING_ALERT_SEVERITIES,
} as const;
