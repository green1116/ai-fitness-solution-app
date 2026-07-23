/**
 * Operations O1 — Success tracking
 */

import { getSuccessPlan } from "./success.plan";
import type {
  SuccessTracking,
  TrackSuccessProgressInput,
} from "./success.types";

const tracking = new Map<string, SuccessTracking>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTracking(entry: SuccessTracking): SuccessTracking {
  return { ...entry };
}

export function trackSuccessProgress(
  input: TrackSuccessProgressInput,
): SuccessTracking {
  const planId = input.planId.trim();
  const milestone = input.milestone.trim();
  if (!planId) throw new Error("tracking.planId is required");
  if (!milestone) throw new Error("tracking.milestone is required");
  if (!getSuccessPlan(planId)) {
    throw new Error(`success plan not found: ${planId}`);
  }
  if (
    !Number.isFinite(input.progress) ||
    input.progress < 0 ||
    input.progress > 100
  ) {
    throw new Error("tracking.progress must be between 0 and 100");
  }

  const id = input.id?.trim() || createId("o1trk");
  if (tracking.has(id)) {
    throw new Error(`success tracking already exists: ${id}`);
  }

  const progress = Math.round(input.progress);
  const entry: SuccessTracking = {
    id,
    planId,
    progress,
    milestone,
    detail: `progress=${progress} milestone=${milestone}`,
    trackedAt: nowIso(),
  };
  tracking.set(id, entry);
  return cloneTracking(entry);
}

export function getSuccessTracking(id: string): SuccessTracking | undefined {
  const entry = tracking.get(id.trim());
  return entry ? cloneTracking(entry) : undefined;
}

export function listSuccessTracking(filter?: {
  planId?: string;
}): SuccessTracking[] {
  let result = [...tracking.values()];
  if (filter?.planId) {
    const pid = filter.planId.trim();
    result = result.filter((t) => t.planId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTracking);
}

export function clearSuccessTracking(): void {
  tracking.clear();
}
