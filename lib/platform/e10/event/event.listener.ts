/**
 * E10-P4 — Event Listener Lifecycle
 */

import { getService } from "../runtime/runtime.registry";
import { getEventType } from "./event.registry";
import type {
  EventListener,
  ListenerStatus,
  PlatformEvent,
  RegisterListenerInput,
} from "./event.types";

type InternalListener = EventListener & {
  handler?: (event: PlatformEvent) => void;
};

const listeners = new Map<string, InternalListener>();
/** eventType → listener ids */
const typeIndex = new Map<string, string[]>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneListener(listener: InternalListener): EventListener {
  return {
    id: listener.id,
    name: listener.name,
    eventType: listener.eventType,
    status: listener.status,
    serviceId: listener.serviceId,
    receivedCount: listener.receivedCount,
    registeredAt: listener.registeredAt,
    metadata: { ...listener.metadata },
  };
}

function pushIndex(eventType: string, id: string): void {
  const list = typeIndex.get(eventType) ?? [];
  if (!list.includes(id)) typeIndex.set(eventType, [...list, id]);
}

function dropIndex(eventType: string, id: string): void {
  const list = typeIndex.get(eventType) ?? [];
  const next = list.filter((x) => x !== id);
  if (next.length === 0) typeIndex.delete(eventType);
  else typeIndex.set(eventType, next);
}

export function registerListener(
  input: RegisterListenerInput,
): EventListener {
  const id = input.id.trim();
  const name = input.name.trim();
  const eventType = input.eventType.trim();
  if (!id) throw new Error("listener.id is required");
  if (!name) throw new Error("listener.name is required");
  if (!eventType) throw new Error("listener.eventType is required");
  if (!getEventType(eventType)) {
    throw new Error(`event type not registered: ${eventType}`);
  }
  if (listeners.has(id)) {
    throw new Error(`listener already registered: ${id}`);
  }

  const serviceId = input.serviceId?.trim();
  if (serviceId && !getService(serviceId)) {
    throw new Error(`runtime service not found: ${serviceId}`);
  }

  const listener: InternalListener = {
    id,
    name,
    eventType,
    status: "REGISTERED",
    serviceId: serviceId || undefined,
    receivedCount: 0,
    registeredAt: nowIso(),
    metadata: { ...(input.metadata ?? {}) },
    handler: input.handler,
  };

  listeners.set(id, listener);
  pushIndex(eventType, id);
  return cloneListener(listener);
}

export function activateListener(id: string): EventListener {
  const listener = listeners.get(id.trim());
  if (!listener) throw new Error(`listener not found: ${id}`);
  if (listener.status === "REMOVED") {
    throw new Error(`cannot activate removed listener: ${id}`);
  }
  listener.status = "ACTIVE";
  listeners.set(listener.id, listener);
  return cloneListener(listener);
}

export function pauseListener(id: string): EventListener {
  const listener = listeners.get(id.trim());
  if (!listener) throw new Error(`listener not found: ${id}`);
  if (listener.status !== "ACTIVE" && listener.status !== "REGISTERED") {
    throw new Error(
      `pause requires ACTIVE or REGISTERED (current=${listener.status})`,
    );
  }
  listener.status = "PAUSED";
  listeners.set(listener.id, listener);
  return cloneListener(listener);
}

export function removeListener(id: string): boolean {
  const listener = listeners.get(id.trim());
  if (!listener) return false;
  dropIndex(listener.eventType, listener.id);
  listener.status = "REMOVED";
  listeners.delete(listener.id);
  return true;
}

export function getListener(id: string): EventListener | undefined {
  const listener = listeners.get(id.trim());
  return listener ? cloneListener(listener) : undefined;
}

export function listListeners(filter?: {
  eventType?: string;
  status?: ListenerStatus;
  serviceId?: string;
}): EventListener[] {
  let result = [...listeners.values()];
  if (filter?.eventType) {
    const eventType = filter.eventType.trim();
    result = result.filter((l) => l.eventType === eventType);
  }
  if (filter?.status) {
    result = result.filter((l) => l.status === filter.status);
  }
  if (filter?.serviceId) {
    const serviceId = filter.serviceId.trim();
    result = result.filter((l) => l.serviceId === serviceId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneListener);
}

/** Internal: active listeners for a type (includes handler). */
export function getActiveListenersInternal(
  eventType: string,
): InternalListener[] {
  const ids = typeIndex.get(eventType.trim()) ?? [];
  const result: InternalListener[] = [];
  for (const id of ids) {
    const listener = listeners.get(id);
    if (listener && listener.status === "ACTIVE") {
      result.push(listener);
    }
  }
  return result;
}

export function bumpReceivedCount(id: string): void {
  const listener = listeners.get(id.trim());
  if (!listener) return;
  listener.receivedCount += 1;
  listeners.set(listener.id, listener);
}

export function clearListeners(): void {
  listeners.clear();
  typeIndex.clear();
}
