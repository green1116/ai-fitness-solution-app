/**
 * V60 P5 — Unified platform event model
 */

export const PLATFORM_EVENT_KINDS = [
  "audit",
  "runtime",
  "system",
  "error",
  "warning",
  "health",
] as const;

export type PlatformEventKind = (typeof PLATFORM_EVENT_KINDS)[number];

export type PlatformEvent = {
  id: string;
  kind: PlatformEventKind;
  name: string;
  source: string;
  organizationId?: string;
  userId?: string;
  severity: "info" | "warn" | "error" | "critical";
  timestamp: string;
  meta?: Record<string, unknown>;
};

declare global {
  // eslint-disable-next-line no-var
  var __v60PlatformEvents: PlatformEvent[] | undefined;
}

function store(): PlatformEvent[] {
  globalThis.__v60PlatformEvents ||= [];
  return globalThis.__v60PlatformEvents;
}

let seq = 0;

export function recordPlatformEvent(
  input: Omit<PlatformEvent, "id" | "timestamp">,
): PlatformEvent {
  const event: PlatformEvent = {
    ...input,
    id: `pev_${++seq}_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  store().push(event);
  if (store().length > 5000) store().splice(0, store().length - 5000);
  return event;
}

export function getPlatformEvents(limit = 100, kind?: PlatformEventKind): PlatformEvent[] {
  const events = store().slice(-limit);
  return kind ? events.filter((e) => e.kind === kind) : events;
}
