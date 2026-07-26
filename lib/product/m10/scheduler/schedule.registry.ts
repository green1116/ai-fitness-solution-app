/**
 * Product M10 — AI Schedule definition registry (definition only)
 */

import { AI_SCHEDULE_KINDS, AI_SCHEDULE_STATUSES } from "./scheduler.constants";
import type {
  AiScheduleDefinition,
  AiScheduleKind,
  AiScheduleStatus,
  RegisterAiScheduleInput,
  UpdateAiScheduleStatusInput,
} from "./scheduler.types";

const schedules = new Map<string, AiScheduleDefinition>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSchedule(
  schedule: AiScheduleDefinition,
): AiScheduleDefinition {
  return { ...schedule, metadata: { ...schedule.metadata } };
}

export function registerAiSchedule(
  input: RegisterAiScheduleInput,
): AiScheduleDefinition {
  const scheduleKey = input.scheduleKey.trim().toUpperCase();
  const title = input.title.trim();
  const expression = input.expression.trim();
  const summary = input.summary.trim();
  if (!scheduleKey) throw new Error("schedule.scheduleKey is required");
  if (!title) throw new Error("schedule.title is required");
  if (!expression) throw new Error("schedule.expression is required");
  if (!summary) throw new Error("schedule.summary is required");
  if (!(AI_SCHEDULE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid schedule kind: ${input.kind}`);
  }
  if (keys.has(scheduleKey)) {
    throw new Error(`scheduleKey already exists: ${scheduleKey}`);
  }

  const id = input.id?.trim() || createId("aisched");
  if (schedules.has(id)) throw new Error(`schedule already exists: ${id}`);

  const now = nowIso();
  const schedule: AiScheduleDefinition = {
    id,
    scheduleKey,
    kind: input.kind,
    status: AI_SCHEDULE_STATUSES[0],
    title,
    expression,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  schedules.set(id, schedule);
  keys.set(scheduleKey, id);
  return cloneSchedule(schedule);
}

export function updateAiScheduleStatus(
  input: UpdateAiScheduleStatusInput,
): AiScheduleDefinition {
  const scheduleId = input.scheduleId.trim();
  if (!scheduleId) throw new Error("schedule.scheduleId is required");
  if (!(AI_SCHEDULE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid schedule status: ${input.status}`);
  }

  const existing = schedules.get(scheduleId);
  if (!existing) throw new Error(`schedule not found: ${scheduleId}`);

  const updated: AiScheduleDefinition = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  schedules.set(scheduleId, updated);
  return cloneSchedule(updated);
}

export function getAiSchedule(id: string): AiScheduleDefinition | undefined {
  const schedule = schedules.get(id.trim());
  return schedule ? cloneSchedule(schedule) : undefined;
}

export function listAiSchedules(filter?: {
  kind?: AiScheduleKind;
  status?: AiScheduleStatus;
}): AiScheduleDefinition[] {
  let result = [...schedules.values()];
  if (filter?.kind) result = result.filter((s) => s.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((s) => s.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.scheduleKey.localeCompare(b.scheduleKey))
    .map(cloneSchedule);
}

export function clearAiSchedules(): void {
  schedules.clear();
  keys.clear();
}
