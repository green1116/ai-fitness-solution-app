/**
 * Launch L3 — Monitoring alert
 */

import { ALERT_SEVERITIES } from "../runtime/runtime.constants";
import { getMonitoringMetric } from "./monitoring.metric";
import type {
  AlertSeverity,
  MonitoringAlert,
  RaiseAlertInput,
} from "./monitoring.types";

const alerts = new Map<string, MonitoringAlert>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAlert(alert: MonitoringAlert): MonitoringAlert {
  return { ...alert };
}

export function raiseMonitoringAlert(
  input: RaiseAlertInput,
): MonitoringAlert {
  const metricId = input.metricId.trim();
  const message = input.message.trim();
  if (!metricId) throw new Error("alert.metricId is required");
  if (!message) throw new Error("alert.message is required");
  if (!getMonitoringMetric(metricId)) {
    throw new Error(`monitoring metric not found: ${metricId}`);
  }
  if (!(ALERT_SEVERITIES as readonly string[]).includes(input.severity)) {
    throw new Error(`invalid alert severity: ${input.severity}`);
  }

  const id = input.id?.trim() || createId("l3alt");
  if (alerts.has(id)) {
    throw new Error(`monitoring alert already exists: ${id}`);
  }

  const alert: MonitoringAlert = {
    id,
    metricId,
    severity: input.severity,
    message,
    detail: `severity=${input.severity} metric=${metricId}`,
    raisedAt: nowIso(),
  };
  alerts.set(id, alert);
  return cloneAlert(alert);
}

export function getMonitoringAlert(id: string): MonitoringAlert | undefined {
  const alert = alerts.get(id.trim());
  return alert ? cloneAlert(alert) : undefined;
}

export function listMonitoringAlerts(filter?: {
  metricId?: string;
  severity?: AlertSeverity;
}): MonitoringAlert[] {
  let result = [...alerts.values()];
  if (filter?.metricId) {
    const mid = filter.metricId.trim();
    result = result.filter((a) => a.metricId === mid);
  }
  if (filter?.severity) {
    result = result.filter((a) => a.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAlert);
}

export function clearMonitoringAlerts(): void {
  alerts.clear();
}
