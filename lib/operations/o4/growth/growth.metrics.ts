/**
 * Operations O4 — Growth metrics
 */

import { GROWTH_METRIC_KINDS } from "./growth.constants";
import type {
  GrowthMetricKind,
  GrowthMetrics,
  RecordGrowthMetricsInput,
} from "./growth.types";

const metrics = new Map<string, GrowthMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneMetrics(entry: GrowthMetrics): GrowthMetrics {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function recordGrowthMetrics(
  input: RecordGrowthMetricsInput,
): GrowthMetrics {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("growth.accountRef is required");
  if (!(GROWTH_METRIC_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid growth metric kind: ${input.kind}`);
  }
  if (!Number.isFinite(input.value) || input.value < 0) {
    throw new Error("growth.value must be a non-negative number");
  }

  const id = input.id?.trim() || createId("o4gmet");
  if (metrics.has(id)) {
    throw new Error(`growth metrics already exists: ${id}`);
  }

  const value = Math.round(input.value);
  const period = (input.period ?? "monthly").trim() || "monthly";
  const entry: GrowthMetrics = {
    id,
    accountRef,
    kind: input.kind,
    value,
    period,
    detail: `kind=${input.kind} value=${value} period=${period}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  metrics.set(id, entry);
  return cloneMetrics(entry);
}

export function getGrowthMetrics(id: string): GrowthMetrics | undefined {
  const entry = metrics.get(id.trim());
  return entry ? cloneMetrics(entry) : undefined;
}

export function listGrowthMetrics(filter?: {
  accountRef?: string;
  kind?: GrowthMetricKind;
}): GrowthMetrics[] {
  let result = [...metrics.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((m) => m.accountRef === aref);
  }
  if (filter?.kind) result = result.filter((m) => m.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearGrowthMetrics(): void {
  metrics.clear();
}
