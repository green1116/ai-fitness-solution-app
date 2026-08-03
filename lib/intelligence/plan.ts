/**
 * WP-63 — Plan Engine
 * Deterministic plan items from TaskItems (read-only).
 */
import { getTask, type TaskItem } from "./task";

export const FEAT_64_ID = "FEAT-64" as const;
export const PLAN_ENGINE_CAPABILITY = "PlanEngine" as const;

export const PLAN_STAGES = ["START", "MIDDLE", "END"] as const;

export type PlanStage = (typeof PLAN_STAGES)[number];

export type PlanItem = Readonly<{
  id: string;
  taskId: string;
  stage: PlanStage;
  position: number;
}>;

export type BuildPlanInput = Readonly<{
  tasks?: readonly TaskItem[];
}>;

const STAGE_RANK: Record<PlanStage, number> = {
  START: 0,
  MIDDLE: 1,
  END: 2,
};

let cachedPlan: PlanItem[] | null = null;

function cloneItem(row: PlanItem): PlanItem {
  return { ...row };
}

function statusToStage(status: TaskItem["status"]): PlanStage {
  if (status === "READY") return "START";
  if (status === "WAITING") return "MIDDLE";
  return "END";
}

/**
 * Build deterministic plan items from TaskItems.
 * Sorted START → MIDDLE → END, then stable taskId.
 */
export function buildPlan(input: BuildPlanInput = {}): PlanItem[] {
  const tasks = input.tasks ? [...input.tasks] : getTask();

  const ranked = tasks.map((t) => ({
    taskId: t.id,
    stage: statusToStage(t.status),
  }));

  ranked.sort((a, b) => {
    const byStage = STAGE_RANK[a.stage] - STAGE_RANK[b.stage];
    if (byStage !== 0) return byStage;
    return a.taskId.localeCompare(b.taskId);
  });

  const out: PlanItem[] = ranked.map((row, index) => ({
    id: `plan-${row.taskId}`,
    taskId: row.taskId,
    stage: row.stage,
    position: index + 1,
  }));

  cachedPlan = out.map(cloneItem);
  return cachedPlan.map(cloneItem);
}

/**
 * Get the last built plans, or build if none cached.
 */
export function getPlan(): PlanItem[] {
  if (!cachedPlan) {
    return buildPlan();
  }
  return cachedPlan.map(cloneItem);
}

/** Test helper — clears cached plans. */
export function clearPlan(): void {
  cachedPlan = null;
}
