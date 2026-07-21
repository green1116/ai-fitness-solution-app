/**
 * E11-P5 — Observability Event Model
 */

import {
  OBSERVABILITY_EVENT_KINDS,
  OBSERVABILITY_EVENT_SEVERITIES,
} from "./observability.constants";
import type {
  EmitObservabilityEventInput,
  ObservabilityEvent,
  ObservabilityEventKind,
  ObservabilityEventSeverity,
} from "./observability.types";

const events: ObservabilityEvent[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEvent(event: ObservabilityEvent): ObservabilityEvent {
  return { ...event, payload: { ...event.payload } };
}

export function emitEvent(
  input: EmitObservabilityEventInput,
): ObservabilityEvent {
  const message = input.message.trim();
  const source = input.source.trim();
  if (!message) throw new Error("event.message is required");
  if (!source) throw new Error("event.source is required");
  if (!(OBSERVABILITY_EVENT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid event kind: ${input.kind}`);
  }

  const severity = input.severity ?? "INFO";
  if (!(OBSERVABILITY_EVENT_SEVERITIES as readonly string[]).includes(severity)) {
    throw new Error(`invalid event severity: ${severity}`);
  }

  const event: ObservabilityEvent = {
    id: input.id?.trim() || createId("oevt"),
    kind: input.kind,
    severity,
    message,
    runtimeId: input.runtimeId?.trim() || undefined,
    tenantId: input.tenantId?.trim() || undefined,
    organizationId: input.organizationId?.trim() || undefined,
    correlationId: input.correlationId?.trim() || undefined,
    source,
    payload: { ...(input.payload ?? {}) },
    occurredAt: nowIso(),
  };
  events.push(event);
  return cloneEvent(event);
}

export function getEvent(id: string): ObservabilityEvent | undefined {
  const event = events.find((e) => e.id === id.trim());
  return event ? cloneEvent(event) : undefined;
}

export function listEvents(filter?: {
  kind?: ObservabilityEventKind;
  severity?: ObservabilityEventSeverity;
  runtimeId?: string;
  tenantId?: string;
}): ObservabilityEvent[] {
  let result = [...events];
  if (filter?.kind) result = result.filter((e) => e.kind === filter.kind);
  if (filter?.severity) {
    result = result.filter((e) => e.severity === filter.severity);
  }
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((e) => e.runtimeId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((e) => e.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt))
    .map(cloneEvent);
}

export function clearEvents(): void {
  events.length = 0;
}

export function eventCount(): number {
  return events.length;
}
