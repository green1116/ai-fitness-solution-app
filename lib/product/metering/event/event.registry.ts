/**
 * Product Metering — Event registry
 */

import { getMeter } from "../meter/meter.registry";
import type { RecordUsageEventInput, UsageEvent } from "./event.types";

const events = new Map<string, UsageEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: UsageEvent): UsageEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordUsageEvent(input: RecordUsageEventInput): UsageEvent {
  const meterId = input.meterId.trim();
  const accountId = input.accountId.trim();
  if (!meterId) throw new Error("event.meterId is required");
  if (!accountId) throw new Error("event.accountId is required");
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("event.quantity must be > 0");
  }

  const meter = getMeter(meterId);
  if (!meter) throw new Error(`meter not found: ${meterId}`);
  if (meter.status !== "ACTIVE") {
    throw new Error(`meter not active: ${meterId}`);
  }

  const id = input.id?.trim() || createId("metevt");
  if (events.has(id)) throw new Error(`usage event already exists: ${id}`);

  const event: UsageEvent = {
    id,
    meterId,
    accountId,
    quantity: input.quantity,
    detail: `meter=${meter.code} qty=${input.quantity}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getUsageEvent(id: string): UsageEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listUsageEvents(filter?: {
  meterId?: string;
  accountId?: string;
}): UsageEvent[] {
  let result = [...events.values()];
  if (filter?.meterId) {
    const meterId = filter.meterId.trim();
    result = result.filter((e) => e.meterId === meterId);
  }
  if (filter?.accountId) {
    const accountId = filter.accountId.trim();
    result = result.filter((e) => e.accountId === accountId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearUsageEvents(): void {
  events.clear();
}
