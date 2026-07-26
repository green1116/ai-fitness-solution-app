/**
 * Product M10 — AI Schedule queue binding registry (soft-ref only)
 */

import { getAiSchedule } from "./schedule.registry";
import { AI_SCHEDULE_BINDING_STATUSES } from "./scheduler.constants";
import { getAiScheduleTrigger } from "./trigger.registry";
import type {
  AiScheduleBindingStatus,
  AiScheduleQueueBinding,
  BindAiScheduleQueueInput,
} from "./scheduler.types";

const bindings = new Map<string, AiScheduleQueueBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: AiScheduleQueueBinding,
): AiScheduleQueueBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindAiScheduleQueue(
  input: BindAiScheduleQueueInput,
): AiScheduleQueueBinding {
  const scheduleId = input.scheduleId.trim();
  const triggerId = input.triggerId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const queueKeyRef = input.queueKeyRef.trim().toUpperCase();
  if (!scheduleId) throw new Error("binding.scheduleId is required");
  if (!triggerId) throw new Error("binding.triggerId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!queueKeyRef) throw new Error("binding.queueKeyRef is required");

  const schedule = getAiSchedule(scheduleId);
  if (!schedule) throw new Error(`schedule not found: ${scheduleId}`);
  if (schedule.status !== "ACTIVE") {
    throw new Error(`schedule not active: ${scheduleId}`);
  }

  const trigger = getAiScheduleTrigger(triggerId);
  if (!trigger) throw new Error(`trigger not found: ${triggerId}`);
  if (trigger.scheduleId !== scheduleId) {
    throw new Error(`trigger schedule mismatch: ${triggerId}`);
  }
  if (trigger.status !== "DECLARED") {
    throw new Error(`trigger not declared: ${triggerId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.scheduleId === scheduleId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("aisbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: AiScheduleQueueBinding = {
    id,
    scheduleId,
    triggerId,
    bindingKey,
    queueKeyRef,
    status: AI_SCHEDULE_BINDING_STATUSES[0],
    detail: `queue=${queueKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getAiScheduleQueueBinding(
  id: string,
): AiScheduleQueueBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listAiScheduleQueueBindings(filter?: {
  scheduleId?: string;
  status?: AiScheduleBindingStatus;
}): AiScheduleQueueBinding[] {
  let result = [...bindings.values()];
  if (filter?.scheduleId) {
    const scheduleId = filter.scheduleId.trim();
    result = result.filter((b) => b.scheduleId === scheduleId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearAiScheduleQueueBindings(): void {
  bindings.clear();
}
