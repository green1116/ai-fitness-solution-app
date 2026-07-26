/**
 * Product M10 — AI Queue job binding registry (soft-ref only)
 */

import { AI_QUEUE_BINDING_STATUSES } from "./queue.constants";
import { getAiQueueChannel } from "./channel.registry";
import { getAiQueue } from "./queue.registry";
import type {
  AiQueueBindingStatus,
  AiQueueJobBinding,
  BindAiQueueJobInput,
} from "./queue.types";

const bindings = new Map<string, AiQueueJobBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: AiQueueJobBinding): AiQueueJobBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiQueueJob(
  input: BindAiQueueJobInput,
): AiQueueJobBinding {
  const queueId = input.queueId.trim();
  const channelId = input.channelId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const jobKeyRef = input.jobKeyRef.trim().toUpperCase();
  if (!queueId) throw new Error("binding.queueId is required");
  if (!channelId) throw new Error("binding.channelId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!jobKeyRef) throw new Error("binding.jobKeyRef is required");

  const queue = getAiQueue(queueId);
  if (!queue) throw new Error(`queue not found: ${queueId}`);
  if (queue.status !== "ACTIVE") {
    throw new Error(`queue not active: ${queueId}`);
  }

  const channel = getAiQueueChannel(channelId);
  if (!channel) throw new Error(`channel not found: ${channelId}`);
  if (channel.queueId !== queueId) {
    throw new Error(`channel queue mismatch: ${channelId}`);
  }
  if (channel.status !== "DECLARED") {
    throw new Error(`channel not declared: ${channelId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.queueId === queueId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("aiqbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiQueueJobBinding = {
    id,
    queueId,
    channelId,
    bindingKey,
    jobKeyRef,
    status: AI_QUEUE_BINDING_STATUSES[0],
    detail: `job=${jobKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiQueueJobBinding(
  id: string,
): AiQueueJobBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiQueueJobBindings(filter?: {
  queueId?: string;
  status?: AiQueueBindingStatus;
}): AiQueueJobBinding[] {
  let result = [...bindings.values()];
  if (filter?.queueId) {
    const queueId = filter.queueId.trim();
    result = result.filter((b) => b.queueId === queueId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiQueueJobBindings(): void {
  bindings.clear();
}
