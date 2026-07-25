/**
 * Product P12 — Rollout registry
 */

import { ROLLOUT_STRATEGIES } from "../launch/launch.constants";
import { getLaunch } from "../launch/launch.registry";
import type {
  AdvanceRolloutInput,
  LaunchRollout,
  StartRolloutInput,
} from "./rollout.types";

const rollouts = new Map<string, LaunchRollout>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRollout(rollout: LaunchRollout): LaunchRollout {
  return {
    ...rollout,
    cohorts: [...rollout.cohorts],
    metadata: { ...rollout.metadata },
  };
}

export function startRollout(input: StartRolloutInput): LaunchRollout {
  const launchId = input.launchId.trim();
  if (!launchId) throw new Error("rollout.launchId is required");
  if (!(ROLLOUT_STRATEGIES as readonly string[]).includes(input.strategy)) {
    throw new Error(`invalid rollout strategy: ${input.strategy}`);
  }
  if (!getLaunch(launchId)) {
    throw new Error(`launch not found: ${launchId}`);
  }

  const percent = input.percent ?? 10;
  if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
    throw new Error("rollout.percent must be between 0 and 100");
  }

  const id = input.id?.trim() || createId("p12rlt");
  if (rollouts.has(id)) {
    throw new Error(`rollout already exists: ${id}`);
  }

  const cohorts = (input.cohorts ?? [])
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
  const rollout: LaunchRollout = {
    id,
    launchId,
    strategy: input.strategy,
    percent,
    cohorts,
    detail: `strategy=${input.strategy} percent=${percent}`,
    metadata: { ...(input.metadata ?? {}) },
    startedAt: nowIso(),
  };
  rollouts.set(id, rollout);
  return cloneRollout(rollout);
}

export function advanceRollout(input: AdvanceRolloutInput): LaunchRollout {
  const rolloutId = input.rolloutId.trim();
  if (!rolloutId) throw new Error("rollout.rolloutId is required");
  if (!Number.isFinite(input.percent) || input.percent < 0 || input.percent > 100) {
    throw new Error("rollout.percent must be between 0 and 100");
  }
  const existing = rollouts.get(rolloutId);
  if (!existing) throw new Error(`rollout not found: ${rolloutId}`);
  if (existing.completedAt) {
    throw new Error(`rollout already complete: ${rolloutId}`);
  }

  const complete = input.complete === true || input.percent >= 100;
  const updated: LaunchRollout = {
    ...existing,
    percent: input.percent,
    cohorts: [...existing.cohorts],
    detail: `strategy=${existing.strategy} percent=${input.percent}`,
    metadata: { ...existing.metadata },
    completedAt: complete ? nowIso() : undefined,
  };
  rollouts.set(rolloutId, updated);
  return cloneRollout(updated);
}

export function getRollout(id: string): LaunchRollout | undefined {
  const rollout = rollouts.get(id.trim());
  return rollout ? cloneRollout(rollout) : undefined;
}

export function listRollouts(filter?: {
  launchId?: string;
}): LaunchRollout[] {
  let result = [...rollouts.values()];
  if (filter?.launchId) {
    const lid = filter.launchId.trim();
    result = result.filter((r) => r.launchId === lid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRollout);
}

export function clearRollouts(): void {
  rollouts.clear();
}
