/**
 * Operations O4 — Growth tracker
 */

import { getGrowthMetrics } from "./growth.metrics";
import type { GrowthTracking, TrackGrowthInput } from "./growth.types";

const tracking = new Map<string, GrowthTracking>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTracking(entry: GrowthTracking): GrowthTracking {
  return { ...entry };
}

export function trackGrowth(input: TrackGrowthInput): GrowthTracking {
  const metricsId = input.metricsId.trim();
  if (!metricsId) throw new Error("growthTracking.metricsId is required");
  const metrics = getGrowthMetrics(metricsId);
  if (!metrics) {
    throw new Error(`growth metrics not found: ${metricsId}`);
  }

  const previous =
    input.previousValue !== undefined && Number.isFinite(input.previousValue)
      ? Math.round(input.previousValue)
      : 0;
  const delta = metrics.value - previous;
  const trend = delta > 0 ? "UP" : delta < 0 ? "DOWN" : "FLAT";

  const id = input.id?.trim() || createId("o4gtrk");
  if (tracking.has(id)) {
    throw new Error(`growth tracking already exists: ${id}`);
  }

  const entry: GrowthTracking = {
    id,
    metricsId: metrics.id,
    accountRef: metrics.accountRef,
    delta,
    trend,
    detail: `delta=${delta} trend=${trend}`,
    trackedAt: nowIso(),
  };
  tracking.set(id, entry);
  return cloneTracking(entry);
}

export function getGrowthTracking(id: string): GrowthTracking | undefined {
  const entry = tracking.get(id.trim());
  return entry ? cloneTracking(entry) : undefined;
}

export function listGrowthTracking(filter?: {
  accountRef?: string;
}): GrowthTracking[] {
  let result = [...tracking.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((t) => t.accountRef === aref);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTracking);
}

export function clearGrowthTracking(): void {
  tracking.clear();
}
