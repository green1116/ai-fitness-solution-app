/**
 * E11-P5 — Telemetry Collector
 * Collects gauges/counters and can ingest execution traces + governance metrics
 */

import { listExecutionTraces } from "../execution/execution.trace";
import { captureGovernanceMetrics } from "../governance/governance.metrics";
import { TELEMETRY_SIGNAL_TYPES } from "./observability.constants";
import type {
  RecordTelemetryInput,
  TelemetrySignal,
  TelemetrySignalType,
} from "./observability.types";

const signals: TelemetrySignal[] = [];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: TelemetrySignal): TelemetrySignal {
  return { ...signal, labels: { ...signal.labels } };
}

export function recordTelemetry(
  input: RecordTelemetryInput,
): TelemetrySignal {
  const name = input.name.trim();
  if (!name) throw new Error("telemetry.name is required");
  if (!(TELEMETRY_SIGNAL_TYPES as readonly string[]).includes(input.type)) {
    throw new Error(`invalid telemetry type: ${input.type}`);
  }
  if (!Number.isFinite(input.value)) {
    throw new Error("telemetry.value must be finite");
  }

  const signal: TelemetrySignal = {
    id: input.id?.trim() || createId("otel"),
    name,
    type: input.type,
    value: input.value,
    unit: input.unit?.trim() || undefined,
    runtimeId: input.runtimeId?.trim() || undefined,
    tenantId: input.tenantId?.trim() || undefined,
    labels: { ...(input.labels ?? {}) },
    recordedAt: nowIso(),
  };
  signals.push(signal);
  return cloneSignal(signal);
}

export function listTelemetry(filter?: {
  type?: TelemetrySignalType;
  name?: string;
  runtimeId?: string;
  tenantId?: string;
}): TelemetrySignal[] {
  let result = [...signals];
  if (filter?.type) result = result.filter((s) => s.type === filter.type);
  if (filter?.name) {
    const name = filter.name.trim();
    result = result.filter((s) => s.name === name);
  }
  if (filter?.runtimeId) {
    const rid = filter.runtimeId.trim();
    result = result.filter((s) => s.runtimeId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((s) => s.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt))
    .map(cloneSignal);
}

/** Pull execution traces into TRACE telemetry signals. */
export function collectExecutionTraceTelemetry(): TelemetrySignal[] {
  const traces = listExecutionTraces();
  const recorded: TelemetrySignal[] = [];
  for (const trace of traces) {
    recorded.push(
      recordTelemetry({
        name: "execution.trace.events",
        type: "TRACE",
        value: trace.events.length,
        runtimeId: trace.runtimeId,
        labels: { taskId: trace.taskId },
      }),
    );
  }
  return recorded;
}

/** Pull governance metrics into GAUGE/COUNTER telemetry. */
export function collectGovernanceTelemetry(): TelemetrySignal[] {
  const metrics = captureGovernanceMetrics();
  return [
    recordTelemetry({
      name: "governance.utilization",
      type: "GAUGE",
      value: metrics.averageUtilization,
      unit: "ratio",
    }),
    recordTelemetry({
      name: "governance.active_allocations",
      type: "GAUGE",
      value: metrics.activeAllocations,
    }),
    recordTelemetry({
      name: "governance.admitted",
      type: "COUNTER",
      value: metrics.admittedCount,
    }),
    recordTelemetry({
      name: "governance.rejected",
      type: "COUNTER",
      value: metrics.rejectedCount,
    }),
  ];
}

export function clearTelemetry(): void {
  signals.length = 0;
}

export function telemetryCount(): number {
  return signals.length;
}
