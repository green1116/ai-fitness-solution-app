/**
 * Product Analytics — Metric registry
 */

import { METRIC_KINDS } from "../foundation/foundation.constants";
import type {
  AnalyticsMetric,
  MetricKind,
  RegisterMetricInput,
} from "./metric.types";

const metrics = new Map<string, AnalyticsMetric>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetric(metric: AnalyticsMetric): AnalyticsMetric {
  return { ...metric, metadata: { ...metric.metadata } };
}

export function registerMetric(input: RegisterMetricInput): AnalyticsMetric {
  const code = input.code.trim().toUpperCase();
  const unit = input.unit.trim();
  if (!code) throw new Error("metric.code is required");
  if (!unit) throw new Error("metric.unit is required");
  if (!(METRIC_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid metric kind: ${input.kind}`);
  }

  const duplicate = [...metrics.values()].find((m) => m.code === code);
  if (duplicate) throw new Error(`metric code already exists: ${code}`);

  const id = input.id?.trim() || createId("anlmet");
  if (metrics.has(id)) throw new Error(`metric already exists: ${id}`);

  const metric: AnalyticsMetric = {
    id,
    code,
    kind: input.kind,
    unit,
    detail: `kind=${input.kind} unit=${unit}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  metrics.set(id, metric);
  return cloneMetric(metric);
}

export function getMetric(id: string): AnalyticsMetric | undefined {
  const metric = metrics.get(id.trim());
  return metric ? cloneMetric(metric) : undefined;
}

export function listMetrics(filter?: {
  kind?: MetricKind;
}): AnalyticsMetric[] {
  let result = [...metrics.values()];
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetric);
}

export function clearMetrics(): void {
  metrics.clear();
}
