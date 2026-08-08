/**
 * V62 P3 — Pilot event telemetry store (in-memory, read-only aggregation)
 */

export const PILOT_TELEMETRY_EVENTS = [
  "pilot_registered",
  "workspace_entered",
  "project_created",
  "quote_generated",
  "pdf_downloaded",
  "tender_pack_opened",
  "feedback_submitted",
  "issue_reported",
  "onboarding_completed",
  "delivery_opened",
  "repeated_usage",
] as const;

export type PilotTelemetryEventName = (typeof PILOT_TELEMETRY_EVENTS)[number];

export type PilotTelemetryRecord = {
  id: string;
  name: PilotTelemetryEventName;
  organizationId?: string;
  userId?: string;
  projectId?: string;
  success?: boolean;
  timestamp: string;
  meta?: Record<string, unknown>;
};

declare global {
  // eslint-disable-next-line no-var
  var __v62PilotTelemetry: PilotTelemetryRecord[] | undefined;
}

function store(): PilotTelemetryRecord[] {
  globalThis.__v62PilotTelemetry ||= [];
  return globalThis.__v62PilotTelemetry;
}

let seq = 0;

export function recordPilotTelemetry(
  input: Omit<PilotTelemetryRecord, "id" | "timestamp">,
): PilotTelemetryRecord {
  const record: PilotTelemetryRecord = {
    ...input,
    id: `ptel_${++seq}_${Date.now()}`,
    timestamp: new Date().toISOString(),
  };
  store().push(record);
  if (store().length > 10000) store().splice(0, store().length - 10000);
  return record;
}

export function getPilotTelemetry(limit = 500, organizationId?: string): PilotTelemetryRecord[] {
  let events = store().slice(-limit);
  if (organizationId) events = events.filter((e) => e.organizationId === organizationId);
  return events;
}

export function countPilotTelemetryByName(
  organizationId?: string,
): Record<string, { total: number; success: number; failed: number }> {
  const counts: Record<string, { total: number; success: number; failed: number }> = {};
  for (const name of PILOT_TELEMETRY_EVENTS) {
    counts[name] = { total: 0, success: 0, failed: 0 };
  }
  for (const e of getPilotTelemetry(10000, organizationId)) {
    const bucket = counts[e.name] ?? { total: 0, success: 0, failed: 0 };
    bucket.total++;
    if (e.success === false) bucket.failed++;
    else bucket.success++;
    counts[e.name] = bucket;
  }
  return counts;
}

export function clearPilotTelemetryForTests(): void {
  globalThis.__v62PilotTelemetry = [];
}
