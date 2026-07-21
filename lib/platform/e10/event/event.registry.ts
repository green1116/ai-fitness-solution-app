/**
 * E10-P4 — Event Type Registry
 */

import {
  E10_EVENT_BASE,
  E10_EVENT_FREEZE_VERSION,
  E10_EVENT_ID,
  E10_EVENT_VERSION,
  EVENT_KINDS,
} from "./event.constants";
import type {
  EventKind,
  EventRegistryManifest,
  EventTypeDefinition,
  RegisterEventTypeInput,
} from "./event.types";

const types = new Map<string, EventTypeDefinition>();

function cloneType(def: EventTypeDefinition): EventTypeDefinition {
  return {
    ...def,
    metadata: { ...def.metadata },
  };
}

function assertKind(kind: string): asserts kind is EventKind {
  if (!(EVENT_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid event kind: ${kind}`);
  }
}

export function registerEventType(
  input: RegisterEventTypeInput,
): EventTypeDefinition {
  const type = input.type.trim();
  const description = input.description.trim();
  if (!type) throw new Error("event type is required");
  if (!description) throw new Error("event description is required");
  assertKind(input.kind);

  if (types.has(type)) {
    throw new Error(`event type already registered: ${type}`);
  }

  const def: EventTypeDefinition = {
    type,
    kind: input.kind,
    description,
    version: (input.version ?? E10_EVENT_VERSION).trim(),
    metadata: { ...(input.metadata ?? {}) },
  };
  types.set(type, def);
  return cloneType(def);
}

export function getEventType(type: string): EventTypeDefinition | undefined {
  const def = types.get(type.trim());
  return def ? cloneType(def) : undefined;
}

export function listEventTypes(filter?: {
  kind?: EventKind;
}): EventTypeDefinition[] {
  let result = [...types.values()];
  if (filter?.kind) {
    result = result.filter((t) => t.kind === filter.kind);
  }
  return result
    .slice()
    .sort((a, b) => a.type.localeCompare(b.type))
    .map(cloneType);
}

export function removeEventType(type: string): boolean {
  return types.delete(type.trim());
}

export function buildEventRegistryManifest(
  listenerCount: number,
): EventRegistryManifest {
  const list = listEventTypes();
  return {
    eventId: E10_EVENT_ID,
    version: E10_EVENT_VERSION,
    freezeVersion: E10_EVENT_FREEZE_VERSION,
    base: E10_EVENT_BASE,
    typeCount: list.length,
    listenerCount,
    types: list,
  };
}

export function clearEventTypes(): void {
  types.clear();
}
