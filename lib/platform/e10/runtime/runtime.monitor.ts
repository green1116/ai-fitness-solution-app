/**
 * E10-P2 — Runtime Health Monitor & Metrics
 */

import {
  getService,
  listServices,
} from "./runtime.registry";
import type {
  RuntimeHealthLevel,
  RuntimeHealthReport,
  RuntimeManagerStatus,
  RuntimeMetricsSnapshot,
  RuntimeService,
} from "./runtime.types";

function nowIso(): string {
  return new Date().toISOString();
}

function levelForService(service: RuntimeService): RuntimeHealthLevel {
  switch (service.status) {
    case "RUNNING":
      return "HEALTHY";
    case "STARTING":
    case "STOPPING":
    case "REGISTERED":
      return "DEGRADED";
    case "FAILED":
      return "UNHEALTHY";
    case "STOPPED":
    case "CREATED":
      return "UNKNOWN";
    default:
      return "UNKNOWN";
  }
}

/** Assess health for a single registered service. */
export function checkServiceHealth(serviceId: string): RuntimeHealthReport {
  const service = getService(serviceId);
  if (!service) {
    return {
      serviceId: serviceId.trim(),
      level: "UNKNOWN",
      ok: false,
      checks: ["service not found"],
      checkedAt: nowIso(),
    };
  }

  const level = levelForService(service);
  const checks: string[] = [
    `status=${service.status}`,
    `kind=${service.kind}`,
    `version=${service.version}`,
  ];
  if (service.moduleId) checks.push(`moduleId=${service.moduleId}`);
  if (service.status === "FAILED") checks.push("service failed");
  if (service.status === "RUNNING") checks.push("service running");

  return {
    serviceId: service.id,
    level,
    ok: level === "HEALTHY",
    checks,
    checkedAt: nowIso(),
  };
}

export function checkRuntimeHealth(): RuntimeHealthReport[] {
  return listServices()
    .map((s) => checkServiceHealth(s.id))
    .sort((a, b) => a.serviceId.localeCompare(b.serviceId));
}

/** Capture aggregate runtime metrics snapshot. */
export function captureMetricsSnapshot(input: {
  runtimeId: string;
  managerStatus: RuntimeManagerStatus;
}): RuntimeMetricsSnapshot {
  const services = listServices();
  const health = checkRuntimeHealth();

  return {
    runtimeId: input.runtimeId,
    managerStatus: input.managerStatus,
    serviceCount: services.length,
    runningCount: services.filter((s) => s.status === "RUNNING").length,
    failedCount: services.filter((s) => s.status === "FAILED").length,
    stoppedCount: services.filter((s) => s.status === "STOPPED").length,
    healthyCount: health.filter((h) => h.level === "HEALTHY").length,
    degradedCount: health.filter((h) => h.level === "DEGRADED").length,
    unhealthyCount: health.filter((h) => h.level === "UNHEALTHY").length,
    capturedAt: nowIso(),
  };
}

export function summarizeHealth(
  reports: RuntimeHealthReport[],
): RuntimeHealthLevel {
  if (reports.length === 0) return "UNKNOWN";
  if (reports.some((r) => r.level === "UNHEALTHY")) return "UNHEALTHY";
  if (reports.some((r) => r.level === "DEGRADED")) return "DEGRADED";
  if (reports.every((r) => r.level === "HEALTHY")) return "HEALTHY";
  return "UNKNOWN";
}
