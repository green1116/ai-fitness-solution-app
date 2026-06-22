/**
 * V61 P2 — Real-time dashboard stream
 */

import type { DashboardStreamEvent } from "../dashboard.types";
import { buildEnterpriseDashboardMetrics } from "../metrics/kpi.engine";
import { buildFunnelSnapshot } from "@/lib/growth/funnel/funnel.analytics";
import { getMetricSnapshot } from "@/lib/observability/metrics.service";

declare global {
  // eslint-disable-next-line no-var
  var __dashboardStreamBuffer: DashboardStreamEvent[] | undefined;
}

function getBuffer(): DashboardStreamEvent[] {
  globalThis.__dashboardStreamBuffer ||= [];
  return globalThis.__dashboardStreamBuffer;
}

export function pushDashboardEvent(event: Omit<DashboardStreamEvent, "timestamp">) {
  const buffer = getBuffer();
  buffer.push({ ...event, timestamp: new Date().toISOString() });
  if (buffer.length > 200) buffer.shift();
  return event;
}

export function getDashboardStreamEvents(since?: string, limit = 50): DashboardStreamEvent[] {
  const events = getBuffer();
  if (!since) return events.slice(-limit);
  return events.filter((e) => e.timestamp > since).slice(-limit);
}

export function emitKpiStreamUpdate(organizationId: string) {
  const metrics = buildEnterpriseDashboardMetrics();
  return pushDashboardEvent({
    type: "kpi_update",
    payload: { organizationId, metrics },
  });
}

export function emitFunnelStreamUpdate() {
  const funnel = buildFunnelSnapshot();
  return pushDashboardEvent({
    type: "funnel_update",
    payload: { funnel },
  });
}

export function emitHealthStreamUpdate() {
  const health = getMetricSnapshot();
  return pushDashboardEvent({
    type: "health_update",
    payload: { health },
  });
}

export function clearDashboardStreamForTests(): void {
  globalThis.__dashboardStreamBuffer = [];
}
