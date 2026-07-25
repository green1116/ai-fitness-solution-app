/**
 * Product P12 — Monitoring registry
 */

import { MONITORING_SEVERITIES } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  LaunchMonitoringSignal,
  MonitoringSeverity,
  RecordMonitoringInput,
} from "./monitoring.types";

const signals = new Map<string, LaunchMonitoringSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: LaunchMonitoringSignal): LaunchMonitoringSignal {
  return { ...signal, metadata: { ...signal.metadata } };
}

export function recordMonitoring(
  input: RecordMonitoringInput,
): LaunchMonitoringSignal {
  const launchId = input.launchId.trim();
  const metric = input.metric.trim();
  if (!launchId) throw new Error("monitoring.launchId is required");
  if (!metric) throw new Error("monitoring.metric is required");
  if (!(MONITORING_SEVERITIES as readonly string[]).includes(input.severity)) {
    throw new Error(`invalid monitoring severity: ${input.severity}`);
  }
  if (!Number.isFinite(input.value)) {
    throw new Error("monitoring.value must be a finite number");
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const id = input.id?.trim() || createId("p12mon");
  if (signals.has(id)) {
    throw new Error(`monitoring signal already exists: ${id}`);
  }

  const message =
    (input.message ?? "").trim() || `${metric}=${input.value}`;
  const signal: LaunchMonitoringSignal = {
    id,
    launchId,
    metric,
    severity: input.severity,
    value: input.value,
    message,
    detail: `severity=${input.severity} metric=${metric}`,
    metadata: { ...(input.metadata ?? {}) },
    observedAt: nowIso(),
  };
  signals.set(id, signal);
  return cloneSignal(signal);
}

export function getMonitoring(
  id: string,
): LaunchMonitoringSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listMonitoring(filter?: {
  launchId?: string;
  severity?: MonitoringSeverity;
}): LaunchMonitoringSignal[] {
  let result = [...signals.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((s) => s.launchId === lid);
  }
  if (filter?.severity) {
    result = result.filter((s) => s.severity === filter.severity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearMonitoring(): void {
  signals.clear();
}
