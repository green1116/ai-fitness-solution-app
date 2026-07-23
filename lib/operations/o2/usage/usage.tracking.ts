/**
 * Operations O2 — Usage tracking
 */

import { getUsageStream } from "./usage.registry";
import type { TrackUsageInput, UsageTracking } from "./usage.types";

const tracking = new Map<string, UsageTracking>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTracking(entry: UsageTracking): UsageTracking {
  return { ...entry };
}

export function trackUsage(input: TrackUsageInput): UsageTracking {
  const streamId = input.streamId.trim();
  if (!streamId) throw new Error("usageTracking.streamId is required");
  if (!getUsageStream(streamId)) {
    throw new Error(`usage stream not found: ${streamId}`);
  }
  if (!Number.isFinite(input.units) || input.units < 0) {
    throw new Error("usageTracking.units must be a non-negative number");
  }

  const id = input.id?.trim() || createId("o2trk");
  if (tracking.has(id)) {
    throw new Error(`usage tracking already exists: ${id}`);
  }

  const units = Math.round(input.units);
  const period = (input.period ?? "daily").trim() || "daily";
  const entry: UsageTracking = {
    id,
    streamId,
    units,
    period,
    detail: `units=${units} period=${period}`,
    trackedAt: nowIso(),
  };
  tracking.set(id, entry);
  return cloneTracking(entry);
}

export function getUsageTracking(id: string): UsageTracking | undefined {
  const entry = tracking.get(id.trim());
  return entry ? cloneTracking(entry) : undefined;
}

export function listUsageTracking(filter?: {
  streamId?: string;
}): UsageTracking[] {
  let result = [...tracking.values()];
  if (filter?.streamId) {
    const sid = filter.streamId.trim();
    result = result.filter((t) => t.streamId === sid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTracking);
}

export function clearUsageTracking(): void {
  tracking.clear();
}
