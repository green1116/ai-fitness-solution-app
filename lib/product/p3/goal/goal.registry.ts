/**
 * Product P3 — Goal registry
 */

import { GOAL_STATUSES } from "../project/project.constants";
import { getProject } from "../project/project.registry";
import type {
  DefineGoalInput,
  GoalStatus,
  ProjectGoal,
  UpdateGoalStatusInput,
} from "./goal.types";

const goals = new Map<string, ProjectGoal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneGoal(goal: ProjectGoal): ProjectGoal {
  return { ...goal, metadata: { ...goal.metadata } };
}

export function defineGoal(input: DefineGoalInput): ProjectGoal {
  const projectId = input.projectId.trim();
  const title = input.title.trim();
  const targetMetric = input.targetMetric.trim();
  if (!projectId) throw new Error("goal.projectId is required");
  if (!title) throw new Error("goal.title is required");
  if (!targetMetric) throw new Error("goal.targetMetric is required");
  if (!Number.isFinite(input.targetValue)) {
    throw new Error("goal.targetValue must be a number");
  }
  if (!getProject(projectId)) {
    throw new Error(`project not found: ${projectId}`);
  }

  const id = input.id?.trim() || createId("p3goal");
  if (goals.has(id)) {
    throw new Error(`goal already exists: ${id}`);
  }

  const now = nowIso();
  const status = GOAL_STATUSES[0];
  const targetValue = Math.round(input.targetValue);
  const goal: ProjectGoal = {
    id,
    projectId,
    title,
    targetMetric,
    targetValue,
    status,
    detail: `metric=${targetMetric} target=${targetValue} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  goals.set(id, goal);
  return cloneGoal(goal);
}

export function updateGoalStatus(input: UpdateGoalStatusInput): ProjectGoal {
  const goalId = input.goalId.trim();
  if (!goalId) throw new Error("goal.goalId is required");
  if (!(GOAL_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid goal status: ${input.status}`);
  }
  const existing = goals.get(goalId);
  if (!existing) throw new Error(`goal not found: ${goalId}`);

  const updated: ProjectGoal = {
    ...existing,
    status: input.status,
    detail: `metric=${existing.targetMetric} target=${existing.targetValue} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  goals.set(goalId, updated);
  return cloneGoal(updated);
}

export function getGoal(id: string): ProjectGoal | undefined {
  const goal = goals.get(id.trim());
  return goal ? cloneGoal(goal) : undefined;
}

export function listGoals(filter?: {
  projectId?: string;
  status?: GoalStatus;
}): ProjectGoal[] {
  let result = [...goals.values()];
  if (filter?.projectId) {
    const pid = filter.projectId.trim();
    result = result.filter((g) => g.projectId === pid);
  }
  if (filter?.status) result = result.filter((g) => g.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneGoal);
}

export function clearGoals(): void {
  goals.clear();
}
