/**
 * Product P8 — Tracking registry
 */

import { TRACKING_EVENTS } from "../tender/tender.constants";
import { getTender } from "../tender/tender.registry";
import type {
  RecordTrackingInput,
  TenderTrackingEvent,
  TrackingEventKind,
} from "./tracking.types";

const events = new Map<string, TenderTrackingEvent>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: TenderTrackingEvent): TenderTrackingEvent {
  return { ...event, metadata: { ...event.metadata } };
}

export function recordTracking(
  input: RecordTrackingInput,
): TenderTrackingEvent {
  const tenderId = input.tenderId.trim();
  const message = input.message.trim();
  if (!tenderId) throw new Error("tracking.tenderId is required");
  if (!message) throw new Error("tracking.message is required");
  if (!(TRACKING_EVENTS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid tracking event: ${input.kind}`);
  }
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }

  const id = input.id?.trim() || createId("p8trk");
  if (events.has(id)) {
    throw new Error(`tracking event already exists: ${id}`);
  }

  const event: TenderTrackingEvent = {
    id,
    tenderId,
    kind: input.kind,
    message,
    detail: `kind=${input.kind}`,
    metadata: { ...(input.metadata ?? {}) },
    recordedAt: nowIso(),
  };
  events.set(id, event);
  return cloneEvent(event);
}

export function getTrackingEvent(
  id: string,
): TenderTrackingEvent | undefined {
  const event = events.get(id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listTrackingEvents(filter?: {
  tenderId?: string;
  kind?: TrackingEventKind;
}): TenderTrackingEvent[] {
  let result = [...events.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((e) => e.tenderId === tid);
  }
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEvent);
}

export function clearTrackingEvents(): void {
  events.clear();
}
