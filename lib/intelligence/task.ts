/**
 * WP-62 — Task Engine
 * Deterministic task items from AssignmentItems (read-only).
 */
import { getAssignment, type AssignmentItem } from "./assignment";

export const FEAT_63_ID = "FEAT-63" as const;
export const TASK_ENGINE_CAPABILITY = "TaskEngine" as const;

export const TASK_STATUSES = ["READY", "WAITING", "DONE"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskItem = Readonly<{
  id: string;
  assignmentId: string;
  status: TaskStatus;
  position: number;
}>;

export type BuildTaskInput = Readonly<{
  assignments?: readonly AssignmentItem[];
}>;

const STATUS_RANK: Record<TaskStatus, number> = {
  READY: 0,
  WAITING: 1,
  DONE: 2,
};

let cachedTask: TaskItem[] | null = null;

function cloneItem(row: TaskItem): TaskItem {
  return { ...row };
}

function assigneeToStatus(
  assignee: AssignmentItem["assignee"],
): TaskStatus {
  if (assignee === "CORE") return "READY";
  if (assignee === "OPS") return "WAITING";
  return "DONE";
}

/**
 * Build deterministic task items from AssignmentItems.
 * Sorted READY → WAITING → DONE, then stable assignmentId.
 */
export function buildTask(input: BuildTaskInput = {}): TaskItem[] {
  const assignments = input.assignments
    ? [...input.assignments]
    : getAssignment();

  const ranked = assignments.map((a) => ({
    assignmentId: a.id,
    status: assigneeToStatus(a.assignee),
  }));

  ranked.sort((a, b) => {
    const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
    if (byStatus !== 0) return byStatus;
    return a.assignmentId.localeCompare(b.assignmentId);
  });

  const out: TaskItem[] = ranked.map((row, index) => ({
    id: `task-${row.assignmentId}`,
    assignmentId: row.assignmentId,
    status: row.status,
    position: index + 1,
  }));

  cachedTask = out.map(cloneItem);
  return cachedTask.map(cloneItem);
}

/**
 * Get the last built tasks, or build if none cached.
 */
export function getTask(): TaskItem[] {
  if (!cachedTask) {
    return buildTask();
  }
  return cachedTask.map(cloneItem);
}

/** Test helper — clears cached tasks. */
export function clearTask(): void {
  cachedTask = null;
}
