/**
 * Operations O2 — Activity event
 */

import { ACTIVITY_EVENT_KINDS } from "../usage/usage.constants";
import type {
  ActivityEvent,
  ActivityEventKind,
  RecordActivityEventInput,
} from "./activity.types";

const events = new Map<string, ActivityEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: ActivityEvent): ActivityEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordActivityEvent(
  input: RecordActivityEventInput,
): ActivityEvent {
  const accountRef = input.accountRef.trim();
  const actor = input.actor.trim();
  const message = input.message.trim();
  if (!accountRef) throw new Error("activity.accountRef is required");
  if (!actor) throw new Error("activity.actor is required");
  if (!message) throw new Error("activity.message is required");
  if (!(ACTIVITY_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid activity event kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("o2act");
  if (events.has(id)) {
    throw new Error(`activity event already exists: ${id}`);
  }

  const event: ActivityEvent = {
    id,
    accountRef,
    kind: input.kind,
    actor,
    message,
    detail: `kind=${input.kind} actor=${actor}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getActivityEvent(id: string): ActivityEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listActivityEvents(filter?: {
  accountRef?: string;
  kind?: ActivityEventKind;
}): ActivityEvent[] {
  let result = [...events.values()];
  if (filter?.accountRef) {
    const aref = filter.accountRef.trim();
    result = result.filter((e) => e.accountRef === aref);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearActivityEvents(): void {
  events.clear();
}
