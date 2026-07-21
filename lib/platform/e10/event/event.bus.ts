/**
 * E10-P4 — In-memory Event Bus (publish / history)
 * No external message broker
 */

import { EVENT_PRIORITIES } from "./event.constants";
import { getEventType } from "./event.registry";
import type {
  EventBusSnapshot,
  EventPriority,
  PlatformEvent,
  PublishEventInput,
} from "./event.types";

const history: PlatformEvent[] = [];
let sequence = 0;

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: PlatformEvent): PlatformEvent {
  return {
    ...event,
    payload: { ...event.payload },
  };
}

function assertPriority(
  priority: string,
): asserts priority is EventPriority {
  if (!(EVENT_PRIORITIES as readonly string[]).includes(priority)) {
    throw new Error(`invalid event priority: ${priority}`);
  }
}

/** Publish an event into bus history (does not dispatch). */
export function publishEvent(input: PublishEventInput): PlatformEvent {
  const type = input.type.trim();
  const source = input.source.trim();
  if (!type) throw new Error("event.type is required");
  if (!source) throw new Error("event.source is required");

  const def = getEventType(type);
  if (!def) throw new Error(`event type not registered: ${type}`);

  const priority = input.priority ?? "NORMAL";
  assertPriority(priority);

  sequence += 1;
  const event: PlatformEvent = {
    id: input.id?.trim() || createId("evt"),
    type,
    kind: def.kind,
    priority,
    source,
    payload: { ...(input.payload ?? {}) },
    createdAt: nowIso(),
    sequence,
  };

  history.push(event);
  return cloneEvent(event);
}

export function getEvent(id: string): PlatformEvent | undefined {
  const event = history.find((e) => e.id === id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listEvents(filter?: {
  type?: string;
  kind?: PlatformEvent["kind"];
  source?: string;
  fromSequence?: number;
  toSequence?: number;
}): PlatformEvent[] {
  let result = [...history];
  if (filter?.type) {
    const type = filter.type.trim();
    result = result.filter((e) => e.type === type);
  }
  if (filter?.kind) {
    result = result.filter((e) => e.kind === filter.kind);
  }
  if (filter?.source) {
    const source = filter.source.trim();
    result = result.filter((e) => e.source === source);
  }
  if (filter?.fromSequence !== undefined) {
    result = result.filter((e) => e.sequence >= filter.fromSequence!);
  }
  if (filter?.toSequence !== undefined) {
    result = result.filter((e) => e.sequence <= filter.toSequence!);
  }
  return result
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map(cloneEvent);
}

export function getBusSnapshot(listenerStats: {
  listenerCount: number;
  activeListenerCount: number;
  typeCount: number;
}): EventBusSnapshot {
  return {
    typeCount: listenerStats.typeCount,
    listenerCount: listenerStats.listenerCount,
    activeListenerCount: listenerStats.activeListenerCount,
    historyCount: history.length,
    lastSequence: sequence,
  };
}

export function clearEventBus(): void {
  history.length = 0;
  sequence = 0;
}
