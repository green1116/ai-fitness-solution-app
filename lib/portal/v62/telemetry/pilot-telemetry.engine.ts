/**
 * V62 P3 — Pilot telemetry aggregation
 */

import {
  countPilotTelemetryByName,
  getPilotTelemetry,
  PILOT_TELEMETRY_EVENTS,
  type PilotTelemetryEventName,
  type PilotTelemetryRecord,
} from "../store/pilot-telemetry.store";

export type TelemetryReport = {
  events: PilotTelemetryRecord[];
  eventNames: readonly PilotTelemetryEventName[];
  countsByName: Record<string, { total: number; success: number; failed: number }>;
  totalEvents: number;
  successRate: number;
  generatedAt: string;
};

export function buildTelemetryReport(organizationId?: string, limit = 200): TelemetryReport {
  const events = getPilotTelemetry(limit, organizationId);
  const countsByName = countPilotTelemetryByName(organizationId);
  const totalEvents = events.length;
  const successEvents = events.filter((e) => e.success !== false).length;
  const successRate = totalEvents === 0 ? 100 : Math.round((successEvents / totalEvents) * 100);

  return {
    events,
    eventNames: PILOT_TELEMETRY_EVENTS,
    countsByName,
    totalEvents,
    successRate,
    generatedAt: new Date().toISOString(),
  };
}

export { PILOT_TELEMETRY_EVENTS };
export type { PilotTelemetryEventName };
