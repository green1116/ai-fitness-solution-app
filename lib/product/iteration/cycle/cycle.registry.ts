/**
 * Product Iteration — Cycle registry
 */

import { CYCLE_STATUSES } from "./cycle.constants";
import type {
  CreateCycleInput,
  CycleStatus,
  IterationCycle,
  UpdateCycleStatusInput,
} from "./cycle.types";

const cycles = new Map<string, IterationCycle>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCycle(cycle: IterationCycle): IterationCycle {
  return { ...cycle, metadata: { ...cycle.metadata } };
}

export function createCycle(input: CreateCycleInput): IterationCycle {
  const name = input.name.trim();
  const goal = input.goal.trim();
  const owner = input.owner.trim();
  if (!name) throw new Error("cycle.name is required");
  if (!goal) throw new Error("cycle.goal is required");
  if (!owner) throw new Error("cycle.owner is required");

  const id = input.id?.trim() || createId("itercyc");
  if (cycles.has(id)) throw new Error(`cycle already exists: ${id}`);

  const now = nowIso();
  const status = CYCLE_STATUSES[0];
  const cycle: IterationCycle = {
    id,
    name,
    goal,
    owner,
    status,
    detail: `status=${status} owner=${owner}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  cycles.set(id, cycle);
  return cloneCycle(cycle);
}

export function updateCycleStatus(
  input: UpdateCycleStatusInput,
): IterationCycle {
  const cycleId = input.cycleId.trim();
  if (!cycleId) throw new Error("cycle.cycleId is required");
  if (!(CYCLE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid cycle status: ${input.status}`);
  }
  const existing = cycles.get(cycleId);
  if (!existing) throw new Error(`cycle not found: ${cycleId}`);

  const updated: IterationCycle = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} owner=${existing.owner}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  cycles.set(cycleId, updated);
  return cloneCycle(updated);
}

export function getCycle(id: string): IterationCycle | undefined {
  const cycle = cycles.get(id.trim());
  return cycle ? cloneCycle(cycle) : undefined;
}

export function listCycles(filter?: {
  status?: CycleStatus;
}): IterationCycle[] {
  let result = [...cycles.values()];
  if (filter?.status) result = result.filter((c) => c.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCycle);
}

export function clearCycles(): void {
  cycles.clear();
}
