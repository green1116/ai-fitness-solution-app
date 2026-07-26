/**
 * Product M10 — AI Queue definition registry (definition only)
 */

import { AI_QUEUE_KINDS, AI_QUEUE_STATUSES } from "./queue.constants";
import type {
  AiQueueDefinition,
  AiQueueKind,
  AiQueueStatus,
  RegisterAiQueueInput,
  UpdateAiQueueStatusInput,
} from "./queue.types";

const queues = new Map<string, AiQueueDefinition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneQueue(queue: AiQueueDefinition): AiQueueDefinition {
  return { ...queue, metadata: { ...queue.metadata } };
}

export function registerAiQueue(
  input: RegisterAiQueueInput,
): AiQueueDefinition {
  const queueKey = input.queueKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!queueKey) throw new Error("queue.queueKey is required");
  if (!title) throw new Error("queue.title is required");
  if (!summary) throw new Error("queue.summary is required");
  if (!(AI_QUEUE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid queue kind: ${input.kind}`);
  }
  if (keys.has(queueKey)) {
    throw new Error(`queueKey already exists: ${queueKey}`);
  }

  const id = input.id?.trim() || createId("aiqueue");
  if (queues.has(id)) throw new Error(`queue already exists: ${id}`);

  const now = nowIso();
  const queue: AiQueueDefinition = {
    id,
    queueKey,
    kind: input.kind,
    status: AI_QUEUE_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  queues.set(id, queue);
  keys.set(queueKey, id);
  return cloneQueue(queue);
}

export function updateAiQueueStatus(
  input: UpdateAiQueueStatusInput,
): AiQueueDefinition {
  const queueId = input.queueId.trim();
  if (!queueId) throw new Error("queue.queueId is required");
  if (!(AI_QUEUE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid queue status: ${input.status}`);
  }

  const existing = queues.get(queueId);
  if (!existing) throw new Error(`queue not found: ${queueId}`);

  const updated: AiQueueDefinition = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  queues.set(queueId, updated);
  return cloneQueue(updated);
}

export function getAiQueue(id: string): AiQueueDefinition | undefined {
  const queue = queues.get(id.trim());
  return queue ? cloneQueue(queue) : undefined;
}

export function listAiQueues(filter?: {
  kind?: AiQueueKind;
  status?: AiQueueStatus;
}): AiQueueDefinition[] {
  let result = [...queues.values()];
  if (filter?.kind) result = result.filter((q) => q.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((q) => q.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.queueKey.localeCompare(b.queueKey))
    .map(cloneQueue);
}

export function clearAiQueues(): void {
  queues.clear();
  keys.clear();
}
