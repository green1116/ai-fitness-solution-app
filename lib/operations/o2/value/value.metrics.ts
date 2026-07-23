/**
 * Operations O2 — Value metrics
 */

import type {
  RecordValueMetricsInput,
  ValueMetrics,
} from "./value.types";

const metrics = new Map<string, ValueMetrics>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function cloneMetrics(entry: ValueMetrics): ValueMetrics {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function recordValueMetrics(
  input: RecordValueMetricsInput,
): ValueMetrics {
  const accountRef = input.accountRef.trim();
  if (!accountRef) throw new Error("value.accountRef is required");
  if (!Number.isFinite(input.usageUnits) || input.usageUnits < 0) {
    throw new Error("value.usageUnits must be a non-negative number");
  }
  if (!Number.isFinite(input.adoptionRate)) {
    throw new Error("value.adoptionRate must be a number");
  }
  if (!Number.isFinite(input.activityIntensity)) {
    throw new Error("value.activityIntensity must be a number");
  }

  const id = input.id?.trim() || createId("o2vmet");
  if (metrics.has(id)) {
    throw new Error(`value metrics already exists: ${id}`);
  }

  const usageUnits = Math.round(input.usageUnits);
  const adoptionRate = clamp(input.adoptionRate);
  const activityIntensity = clamp(input.activityIntensity);
  const entry: ValueMetrics = {
    id,
    accountRef,
    usageUnits,
    adoptionRate,
    activityIntensity,
    detail: `units=${usageUnits} adoption=${adoptionRate} intensity=${activityIntensity}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  metrics.set(id, entry);
  return cloneMetrics(entry);
}

export function getValueMetrics(id: string): ValueMetrics | undefined {
  const entry = metrics.get(id.trim());
  return entry ? cloneMetrics(entry) : undefined;
}

export function listValueMetrics(filter?: {
  accountRef?: string;
}): ValueMetrics[] {
  let result = [...metrics.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((m) => m.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMetrics);
}

export function clearValueMetrics(): void {
  metrics.clear();
}
