/**
 * E11-P5 — Observability Metrics
 */

import { listExecutionTraces } from "../execution/execution.trace";
import { OBSERVABILITY_EVENT_KINDS } from "./observability.constants";
import { anomalyCount, listAnomalies } from "./observability.anomaly";
import { auditCount } from "./observability.audit";
import { eventCount, listEvents } from "./observability.event";
import { aggregateObservabilityHealth } from "./observability.health";
import { telemetryCount } from "./observability.telemetry";
import type {
  ObservabilityEventKind,
  ObservabilityMetrics,
} from "./observability.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function captureObservabilityMetrics(): ObservabilityMetrics {
  const health = aggregateObservabilityHealth();
  const events = listEvents();
  const byEventKind = Object.fromEntries(
    OBSERVABILITY_EVENT_KINDS.map((k) => [k, 0]),
  ) as Record<ObservabilityEventKind, number>;
  for (const e of events) {
    byEventKind[e.kind] += 1;
  }

  const errorEventCount = events.filter(
    (e) => e.severity === "ERROR" || e.severity === "CRITICAL",
  ).length;

  return {
    eventCount: eventCount(),
    telemetryCount: telemetryCount(),
    auditCount: auditCount(),
    anomalyCount: anomalyCount(),
    errorEventCount,
    healthOk: health.ok,
    healthLevel: health.level,
    governanceUtilization: health.governanceUtilization,
    executionTraceCount: listExecutionTraces().length,
    byEventKind,
    snappedAt: nowIso(),
  };
}

export function recentAnomalyCount(): number {
  return listAnomalies().length;
}
