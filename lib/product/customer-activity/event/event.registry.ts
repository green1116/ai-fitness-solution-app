/**
 * Product Customer Activity — Event registry
 */

import { ACTIVITY_EVENT_KINDS } from "../activity/activity.constants";
import type {
  ActivityEventKind,
  CustomerActivityEvent,
  RecordActivityEventInput,
} from "./event.types";

const events = new Map<string, CustomerActivityEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: CustomerActivityEvent): CustomerActivityEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordActivityEvent(
  input: RecordActivityEventInput,
): CustomerActivityEvent {
  const customerId = input.customerId.trim();
  const summary = input.summary.trim();
  if (!customerId) throw new Error("event.customerId is required");
  if (!summary) throw new Error("event.summary is required");
  if (!(ACTIVITY_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid activity event kind: ${input.kind}`);
  }

  const id = input.id?.trim() || createId("cactev");
  if (events.has(id)) throw new Error(`activity event already exists: ${id}`);

  const event: CustomerActivityEvent = {
    id,
    customerId,
    kind: input.kind,
    summary,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    occurredAt: input.occurredAt?.trim() || nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getActivityEvent(
  id: string,
): CustomerActivityEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listActivityEvents(filter?: {
  customerId?: string;
  kind?: ActivityEventKind;
}): CustomerActivityEvent[] {
  let result = [...events.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((e) => e.customerId === customerId);
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
