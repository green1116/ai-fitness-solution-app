/**
 * E11-P2 — Execution Queue
 * In-memory priority queue for cloud execution tasks
 */

import {
  EXECUTION_PRIORITIES,
  EXECUTION_TASK_KINDS,
  EXECUTION_TASK_STATUSES,
} from "./execution.constants";
import type {
  CreateExecutionTaskInput,
  ExecutionPriority,
  ExecutionTask,
  ExecutionTaskKind,
  ExecutionTaskStatus,
} from "./execution.types";

const tasks = new Map<string, ExecutionTask>();
/** Ordered queue of task ids (priority then FIFO). */
const queue: string[] = [];

const PRIORITY_RANK: Record<ExecutionPriority, number> = {
  CRITICAL: 0,
  HIGH: 1,
  NORMAL: 2,
  LOW: 3,
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTask(task: ExecutionTask): ExecutionTask {
  return {
    ...task,
    payload: { ...task.payload },
    metadata: { ...task.metadata },
  };
}

function assertKind(kind: string): asserts kind is ExecutionTaskKind {
  if (!(EXECUTION_TASK_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid execution task kind: ${kind}`);
  }
}

function assertPriority(
  priority: string,
): asserts priority is ExecutionPriority {
  if (!(EXECUTION_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid execution priority: ${priority}`);
  }
}

function reindexQueue(): void {
  queue.sort((a, b) => {
    const ta = tasks.get(a);
    const tb = tasks.get(b);
    if (!ta || !tb) return 0;
    const pr = PRIORITY_RANK[ta.priority] - PRIORITY_RANK[tb.priority];
    if (pr !== 0) return pr;
    return (ta.queuedAt ?? ta.createdAt).localeCompare(
      tb.queuedAt ?? tb.createdAt,
    );
  });
}

export function createTask(input: CreateExecutionTaskInput): ExecutionTask {
  const name = input.name.trim();
  const runtimeId = input.runtimeId.trim();
  if (!name) throw new Error("task.name is required");
  if (!runtimeId) throw new Error("task.runtimeId is required");
  assertKind(input.kind);

  const priority = input.priority ?? "NORMAL";
  assertPriority(priority);

  const id = input.id?.trim() || createId("task");
  if (tasks.has(id)) {
    throw new Error(`execution task already exists: ${id}`);
  }

  const task: ExecutionTask = {
    id,
    name,
    kind: input.kind,
    status: "PENDING",
    priority,
    runtimeId,
    contextId: input.contextId?.trim() || undefined,
    payload: { ...(input.payload ?? {}) },
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  tasks.set(id, task);
  return cloneTask(task);
}

export function enqueueTask(taskId: string): ExecutionTask {
  const task = tasks.get(taskId.trim());
  if (!task) throw new Error(`execution task not found: ${taskId}`);
  if (task.status !== "PENDING" && task.status !== "CANCELLED") {
    throw new Error(
      `enqueue requires PENDING or CANCELLED (current=${task.status})`,
    );
  }
  if (queue.includes(task.id)) {
    throw new Error(`task already queued: ${task.id}`);
  }

  task.status = "QUEUED";
  task.queuedAt = nowIso();
  task.error = undefined;
  tasks.set(task.id, task);
  queue.push(task.id);
  reindexQueue();
  return cloneTask(task);
}

export function dequeueTask(): ExecutionTask | undefined {
  while (queue.length > 0) {
    const id = queue.shift()!;
    const task = tasks.get(id);
    if (!task) continue;
    if (task.status !== "QUEUED") continue;
    return cloneTask(task);
  }
  return undefined;
}

/** Remove a queued task id from the queue without changing status. */
export function removeFromQueue(taskId: string): boolean {
  const id = taskId.trim();
  const idx = queue.indexOf(id);
  if (idx < 0) return false;
  queue.splice(idx, 1);
  return true;
}

export function peekQueue(): ExecutionTask[] {
  const result: ExecutionTask[] = [];
  for (const id of queue) {
    const task = tasks.get(id);
    if (task && task.status === "QUEUED") {
      result.push(cloneTask(task));
    }
  }
  return result;
}

export function getTask(id: string): ExecutionTask | undefined {
  const task = tasks.get(id.trim());
  return task ? cloneTask(task) : undefined;
}

export function listTasks(filter?: {
  runtimeId?: string;
  status?: ExecutionTaskStatus;
  kind?: ExecutionTaskKind;
}): ExecutionTask[] {
  let result = [...tasks.values()];
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((t) => t.runtimeId === rid);
  }
  if (filter?.status) {
    if (!(EXECUTION_TASK_STATUSES as readonly string[]).includes(filter.status)) {
      throw new Error(`invalid task status: ${filter.status}`);
    }
    result = result.filter((t) => t.status === filter.status);
  }
  if (filter?.kind) {
    result = result.filter((t) => t.kind === filter.kind);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTask);
}

export function updateTask(
  taskId: string,
  patch: Partial<
    Pick<
      ExecutionTask,
      | "status"
      | "startedAt"
      | "finishedAt"
      | "error"
      | "contextId"
      | "queuedAt"
    >
  >,
): ExecutionTask {
  const task = tasks.get(taskId.trim());
  if (!task) throw new Error(`execution task not found: ${taskId}`);
  if (patch.status !== undefined) {
    if (!(EXECUTION_TASK_STATUSES as readonly string[]).includes(patch.status)) {
      throw new Error(`invalid task status: ${patch.status}`);
    }
    task.status = patch.status;
  }
  if (patch.startedAt !== undefined) task.startedAt = patch.startedAt;
  if (patch.finishedAt !== undefined) task.finishedAt = patch.finishedAt;
  if (patch.error !== undefined) task.error = patch.error;
  if (patch.contextId !== undefined) task.contextId = patch.contextId;
  if (patch.queuedAt !== undefined) task.queuedAt = patch.queuedAt;
  tasks.set(task.id, task);
  return cloneTask(task);
}

export function cancelQueuedTask(taskId: string): ExecutionTask {
  const task = tasks.get(taskId.trim());
  if (!task) throw new Error(`execution task not found: ${taskId}`);
  if (task.status !== "QUEUED" && task.status !== "PENDING") {
    throw new Error(
      `cancel requires QUEUED or PENDING (current=${task.status})`,
    );
  }
  const idx = queue.indexOf(task.id);
  if (idx >= 0) queue.splice(idx, 1);
  task.status = "CANCELLED";
  task.finishedAt = nowIso();
  tasks.set(task.id, task);
  return cloneTask(task);
}

export function queueDepth(): number {
  return peekQueue().length;
}

export function clearExecutionQueue(): void {
  tasks.clear();
  queue.length = 0;
}
