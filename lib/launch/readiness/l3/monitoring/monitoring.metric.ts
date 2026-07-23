/**
 * Launch L3 — Monitoring metric
 */

import { METRIC_KINDS } from "../runtime/runtime.constants";
import { getRuntime } from "../runtime/runtime.status";
import type {
  MetricKind,
  MonitoringMetric,
  RecordMetricInput,
} from "./monitoring.types";

const metrics = new Map<string, MonitoringMetric>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetric(metric: MonitoringMetric): MonitoringMetric {
  return { ...metric, metadata: { ...metric.metadata } };
}

export function recordMonitoringMetric(
  input: RecordMetricInput,
): MonitoringMetric {
  const name = input.name.trim();
  const runtimeId = input.runtimeId.trim();
  if (!name) throw new Error("metric.name is required");
  if (!runtimeId) throw new Error("metric.runtimeId is required");
  if (!getRuntime(runtimeId)) {
    throw new Error(`runtime not found: ${runtimeId}`);
  }
  if (!(METRIC_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid metric kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error("metric.value must be a non-negative number");
  }

  const id = input.id?.trim() || createId("l3met");
  if (metrics.has(id)) {
    throw new Error(`monitoring metric already exists: ${id}`);
  }

  const unit = (input.unit ?? "").trim() || "count";
  const value = Math.round(input.value * 100) / 100;
  const metric: MonitoringMetric = {
    id,
    runtimeId,
    name,
    kind: input.kind,
    value,
    unit,
    detail: `kind=${input.kind} value=${value}${unit}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  metrics.set(id, metric);
  return cloneMetric(metric);
}

export function getMonitoringMetric(
  id: string,
): MonitoringMetric | undefined {
  const metric = metrics.get(id.trim());
  return metric ? cloneMetric(metric) : undefined;
}

export function listMonitoringMetrics(filter?: {
  runtimeId?: string;
  kind?: MetricKind;
}): MonitoringMetric[] {
  let result = [...metrics.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((m) => m.runtimeId === rid);
  }
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetric);
}

export function clearMonitoringMetrics(): void {
  metrics.clear();
}
