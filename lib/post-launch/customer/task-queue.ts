/**
 * FEAT-47 — Task Queue
 * In-memory tasks bound to WorkflowEngine (+ CustomerAutomation).
 */
import { getCustomerAutomation } from "./customer-automation";
import { getWorkflow } from "./workflow-engine";

export const FEAT_47_ID = "FEAT-47" as const;
export const TASK_QUEUE_CAPABILITY = "TaskQueue" as const;

export const TASK_STATUSES = [
  "PENDING",
  "RUNNING",
  "DONE",
  "FAILED",
] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export type TaskQueueItem = Readonly<{
  taskId: string;
  workflowId: string;
  status: TaskStatus;
  title: string;
  payload: Readonly<Record<string, unknown>>;
  updatedAt: string;
}>;

export type EnqueueTaskInput = Readonly<{
  taskId?: string;
  workflowId: string;
  title: string;
  payload?: Readonly<Record<string, unknown>>;
}>;

export type ListTasksFilter = Readonly<{
  workflowId?: string;
  status?: TaskStatus;
}>;

const tasks = new Map<string, TaskQueueItem>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTask(row: TaskQueueItem): TaskQueueItem {
  return {
    ...row,
    payload: { ...row.payload },
  };
}

function requireTrimmed(value: string, field: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new Error(`taskQueue.${field} is required`);
  return trimmed;
}

function assertStatus(status: string): asserts status is TaskStatus {
  if (!(TASK_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid task status: ${status}`);
  }
}

function requireWorkflowStack(workflowId: string): string {
  const id = requireTrimmed(workflowId, "workflowId");
  const workflow = getWorkflow(id);
  if (!workflow) {
    throw new Error(`workflow not found: ${id}`);
  }
  if (!getCustomerAutomation(workflow.automationId)) {
    throw new Error(`automation not found: ${workflow.automationId}`);
  }
  return id;
}

/**
 * Enqueue a task for an existing workflow (+ automation).
 */
export function enqueueTask(input: EnqueueTaskInput): TaskQueueItem {
  const workflowId = requireWorkflowStack(input.workflowId);
  const title = requireTrimmed(input.title, "title");
  const payload = { ...(input.payload ?? {}) };

  const taskId = input.taskId
    ? requireTrimmed(input.taskId, "taskId")
    : createId("task");

  if (tasks.has(taskId)) {
    throw new Error(`task already exists: ${taskId}`);
  }

  const row: TaskQueueItem = {
    taskId,
    workflowId,
    status: "PENDING",
    title,
    payload,
    updatedAt: nowIso(),
  };
  tasks.set(taskId, row);
  return cloneTask(row);
}

/**
 * Get task by taskId.
 */
export function getTask(taskId: string): TaskQueueItem | undefined {
  const id = taskId.trim();
  if (!id) return undefined;
  const row = tasks.get(id);
  return row ? cloneTask(row) : undefined;
}

/**
 * List tasks with optional filters.
 */
export function listTasks(filter: ListTasksFilter = {}): TaskQueueItem[] {
  let rows = [...tasks.values()];
  if (filter.workflowId) {
    const workflowId = requireTrimmed(filter.workflowId, "workflowId");
    rows = rows.filter((r) => r.workflowId === workflowId);
  }
  if (filter.status) {
    assertStatus(filter.status);
    rows = rows.filter((r) => r.status === filter.status);
  }
  return rows
    .slice()
    .sort((a, b) => a.taskId.localeCompare(b.taskId))
    .map(cloneTask);
}

/**
 * Start a PENDING task (→ RUNNING).
 */
export function startTask(taskId: string): TaskQueueItem {
  const id = requireTrimmed(taskId, "taskId");
  const existing = tasks.get(id);
  if (!existing) {
    throw new Error(`task not found: ${id}`);
  }
  if (existing.status !== "PENDING") {
    throw new Error(
      `task can only start from PENDING, got ${existing.status}`,
    );
  }
  requireWorkflowStack(existing.workflowId);

  const updated: TaskQueueItem = {
    ...existing,
    status: "RUNNING",
    updatedAt: nowIso(),
  };
  tasks.set(id, updated);
  return cloneTask(updated);
}

/**
 * Complete a RUNNING task (→ DONE).
 */
export function completeTask(taskId: string): TaskQueueItem {
  const id = requireTrimmed(taskId, "taskId");
  const existing = tasks.get(id);
  if (!existing) {
    throw new Error(`task not found: ${id}`);
  }
  if (existing.status !== "RUNNING") {
    throw new Error(
      `task can only complete from RUNNING, got ${existing.status}`,
    );
  }
  requireWorkflowStack(existing.workflowId);

  const updated: TaskQueueItem = {
    ...existing,
    status: "DONE",
    updatedAt: nowIso(),
  };
  tasks.set(id, updated);
  return cloneTask(updated);
}

/**
 * Fail a RUNNING task (→ FAILED).
 */
export function failTask(taskId: string): TaskQueueItem {
  const id = requireTrimmed(taskId, "taskId");
  const existing = tasks.get(id);
  if (!existing) {
    throw new Error(`task not found: ${id}`);
  }
  if (existing.status !== "RUNNING") {
    throw new Error(
      `task can only fail from RUNNING, got ${existing.status}`,
    );
  }
  requireWorkflowStack(existing.workflowId);

  const updated: TaskQueueItem = {
    ...existing,
    status: "FAILED",
    updatedAt: nowIso(),
  };
  tasks.set(id, updated);
  return cloneTask(updated);
}

/** Test helper — clears in-memory tasks. */
export function clearTasks(): void {
  tasks.clear();
}
