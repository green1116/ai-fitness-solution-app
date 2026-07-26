/**
 * Product M10 — AI Schedule trigger registry (definition only)
 */

import { AI_SCHEDULE_TRIGGER_STATUSES } from "./scheduler.constants";
import { getAiSchedule } from "./schedule.registry";
import type {
  AiScheduleTrigger,
  AiScheduleTriggerStatus,
  RegisterAiScheduleTriggerInput,
  UpdateAiScheduleTriggerStatusInput,
} from "./scheduler.types";

const triggers = new Map<string, AiScheduleTrigger>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTrigger(trigger: AiScheduleTrigger): AiScheduleTrigger {
  return { ...trigger, metadata: { ...trigger.metadata } };
}

export function registerAiScheduleTrigger(
  input: RegisterAiScheduleTriggerInput,
): AiScheduleTrigger {
  const scheduleId = input.scheduleId.trim();
  const triggerKey = input.triggerKey.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!scheduleId) throw new Error("trigger.scheduleId is required");
  if (!triggerKey) throw new Error("trigger.triggerKey is required");
  if (!summary) throw new Error("trigger.summary is required");

  const schedule = getAiSchedule(scheduleId);
  if (!schedule) throw new Error(`schedule not found: ${scheduleId}`);
  if (schedule.status !== "ACTIVE" && schedule.status !== "DRAFT") {
    throw new Error(`schedule not editable: ${scheduleId}`);
  }

  const duplicate = [...triggers.values()].find(
    (t) => t.scheduleId === scheduleId && t.triggerKey === triggerKey,
  );
  if (duplicate) {
    throw new Error(`triggerKey already exists: ${triggerKey}`);
  }

  const id = input.id?.trim() || createId("aistrig");
  if (triggers.has(id)) throw new Error(`trigger already exists: ${id}`);

  const now = nowIso();
  const trigger: AiScheduleTrigger = {
    id,
    scheduleId,
    triggerKey,
    status: AI_SCHEDULE_TRIGGER_STATUSES[0],
    summary,
    detail: `status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  triggers.set(id, trigger);
  return cloneTrigger(trigger);
}

export function updateAiScheduleTriggerStatus(
  input: UpdateAiScheduleTriggerStatusInput,
): AiScheduleTrigger {
  const triggerId = input.triggerId.trim();
  if (!triggerId) throw new Error("trigger.triggerId is required");
  if (
    !(AI_SCHEDULE_TRIGGER_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid trigger status: ${input.status}`);
  }

  const existing = triggers.get(triggerId);
  if (!existing) throw new Error(`trigger not found: ${triggerId}`);

  const updated: AiScheduleTrigger = {
    ...existing,
    status: input.status,
    detail: `status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  triggers.set(triggerId, updated);
  return cloneTrigger(updated);
}

export function getAiScheduleTrigger(
  id: string,
): AiScheduleTrigger | undefined {
  const trigger = triggers.get(id.trim());
  return trigger ? cloneTrigger(trigger) : undefined;
}

export function listAiScheduleTriggers(filter?: {
  scheduleId?: string;
  status?: AiScheduleTriggerStatus;
}): AiScheduleTrigger[] {
  let result = [...triggers.values()];
  if (filter?.scheduleId) {
    const scheduleId = filter.scheduleId.trim();
    result = result.filter((t) => t.scheduleId === scheduleId);
  }
  if (filter?.status) {
    result = result.filter((t) => t.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.triggerKey.localeCompare(b.triggerKey))
    .map(cloneTrigger);
}

export function clearAiScheduleTriggers(): void {
  triggers.clear();
}
