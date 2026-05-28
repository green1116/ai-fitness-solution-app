/**
 * V4-A2 Operational Signal Intelligence — normalization & batching (pure functions)
 */

import { V4_OPERATION_TIMESTAMP } from "../shared";
import { buildProductionOperationsRegistry } from "../registry";
import { buildOperationalStabilityReport } from "../stability";
import { getReleaseFoundationForOperations } from "../operations-context";
import {
  OPERATIONAL_SIGNAL_KINDS,
  V4A2_INTELLIGENCE_VERSION,
  type OperationalSignal,
  type OperationalSignalBatch,
  type OperationalSignalKind,
  type OperationalSignalUnit,
} from "./types";

export type RawOperationalSignalInput = {
  kind: OperationalSignalKind;
  label?: string;
  value?: number;
  unit?: OperationalSignalUnit;
  normalizedScore?: number;
  source?: string;
  traceId?: string;
  observedAt?: string;
};

export type NormalizeSignalDefaults = {
  deploymentId: string;
  traceRoot: string;
  observedAt: string;
};

const SIGNAL_LABELS: Record<OperationalSignalKind, string> = {
  throughput: "Operational throughput",
  latency: "Execution latency proxy",
  errorRate: "Degraded operation rate",
  retryCount: "Stabilizing retries",
  fallbackCount: "Maintenance fallbacks",
  successRatio: "Success ratio",
  queuePressure: "Queue pressure",
  resourcePressure: "Resource pressure",
  executionDrift: "Baseline execution drift",
  recoveryFrequency: "Recovery events",
};

const SIGNAL_UNITS: Record<OperationalSignalKind, OperationalSignalUnit> = {
  throughput: "ratio",
  latency: "score",
  errorRate: "ratio",
  retryCount: "count",
  fallbackCount: "count",
  successRatio: "ratio",
  queuePressure: "pressure",
  resourcePressure: "pressure",
  executionDrift: "score",
  recoveryFrequency: "count",
};

const DEFAULT_SIGNAL_VALUES: Record<OperationalSignalKind, number> = {
  throughput: 0,
  latency: 0,
  errorRate: 0,
  retryCount: 0,
  fallbackCount: 0,
  successRatio: 0,
  queuePressure: 0,
  resourcePressure: 0,
  executionDrift: 0,
  recoveryFrequency: 0,
};

export function clampNormalizedScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function normalizeOperationalSignal(
  input: RawOperationalSignalInput,
  defaults: NormalizeSignalDefaults,
): OperationalSignal {
  const kind = input.kind;
  const value = input.value ?? DEFAULT_SIGNAL_VALUES[kind];
  const unit = input.unit ?? SIGNAL_UNITS[kind];
  const normalizedScore = clampNormalizedScore(
    input.normalizedScore ?? (unit === "ratio" || unit === "score" ? value : clampNormalizedScore(100 - value * 10)),
  );

  return {
    id: `sig-${kind}`,
    kind,
    label: input.label ?? SIGNAL_LABELS[kind],
    value,
    unit,
    normalizedScore,
    source: input.source ?? "operations.raw",
    traceId: input.traceId ?? `${defaults.traceRoot}-${kind}`,
    observedAt: input.observedAt ?? defaults.observedAt,
  };
}

export function normalizeSignalBatch(
  inputs: readonly RawOperationalSignalInput[],
  defaults: NormalizeSignalDefaults,
): OperationalSignal[] {
  return inputs.map((input) => normalizeOperationalSignal(input, defaults));
}

export function groupSignalsByKind(
  batch: OperationalSignalBatch,
): Record<OperationalSignalKind, OperationalSignal[]> {
  const grouped = Object.fromEntries(
    OPERATIONAL_SIGNAL_KINDS.map((kind) => [kind, [] as OperationalSignal[]]),
  ) as Record<OperationalSignalKind, OperationalSignal[]>;

  for (const signal of batch.signals) {
    grouped[signal.kind].push(signal);
  }
  return grouped;
}

export function groupSignalsBySource(
  batch: OperationalSignalBatch,
): Record<string, OperationalSignal[]> {
  const grouped: Record<string, OperationalSignal[]> = {};
  for (const signal of batch.signals) {
    if (!grouped[signal.source]) grouped[signal.source] = [];
    grouped[signal.source].push(signal);
  }
  return grouped;
}

export function averageNormalizedScore(signals: readonly OperationalSignal[]): number {
  if (signals.length === 0) return 0;
  return clampNormalizedScore(
    signals.reduce((sum, s) => sum + s.normalizedScore, 0) / signals.length,
  );
}

function collectRawSignalInputs(deploymentId: string, traceRoot: string): RawOperationalSignalInput[] {
  const release = getReleaseFoundationForOperations(deploymentId);
  const registry = buildProductionOperationsRegistry({ deploymentId });
  const stability = buildOperationalStabilityReport({ deploymentId });

  const total = registry.records.length;
  const degraded = stability.degradedOpsCount;
  const active = registry.activeCount;
  const frozen = registry.frozenCount;
  const stabilizing = registry.records.filter((r) => r.status === "stabilizing").length;
  const maintenance = registry.records.filter((r) => r.status === "maintenance").length;

  const throughput = total > 0 ? (registry.operationalCount / total) * 100 : 0;
  const errorRate = total > 0 ? (degraded / total) * 100 : 0;
  const successRatio = total > 0 ? ((active + frozen) / total) * 100 : 0;
  const avgConfidence =
    registry.records.reduce((s, r) => s + r.operationalConfidence, 0) / Math.max(total, 1);
  const latencyProxy = clampNormalizedScore(100 - (100 - avgConfidence) * 0.6);
  const queuePressure = clampNormalizedScore(100 - throughput);
  const resourcePressure = clampNormalizedScore(100 - stability.stabilityIndex);
  const executionDrift = release.freeze.integrityState === "sealed" ? 5 : 35;
  const recoveryFrequency = frozen + stabilizing;

  const rows: RawOperationalSignalInput[] = [
    { kind: "throughput", value: throughput, normalizedScore: throughput, source: "registry" },
    {
      kind: "latency",
      value: 100 - latencyProxy,
      normalizedScore: latencyProxy,
      source: "registry.confidence",
    },
    {
      kind: "errorRate",
      value: errorRate,
      normalizedScore: clampNormalizedScore(100 - errorRate),
      source: "stability",
    },
    {
      kind: "retryCount",
      value: stabilizing,
      normalizedScore: clampNormalizedScore(100 - stabilizing * 15),
      source: "registry.status",
    },
    {
      kind: "fallbackCount",
      value: maintenance,
      normalizedScore: clampNormalizedScore(100 - maintenance * 20),
      source: "registry.status",
    },
    { kind: "successRatio", value: successRatio, normalizedScore: successRatio, source: "registry" },
    {
      kind: "queuePressure",
      value: queuePressure,
      normalizedScore: clampNormalizedScore(100 - queuePressure),
      source: "registry",
    },
    {
      kind: "resourcePressure",
      value: resourcePressure,
      normalizedScore: clampNormalizedScore(100 - resourcePressure),
      source: "stability",
    },
    {
      kind: "executionDrift",
      value: executionDrift,
      normalizedScore: clampNormalizedScore(100 - executionDrift),
      source: "freeze",
    },
    {
      kind: "recoveryFrequency",
      value: recoveryFrequency,
      normalizedScore: clampNormalizedScore(90 - recoveryFrequency * 5),
      source: "registry.frozen",
    },
  ];
  return rows.map((row) => ({ ...row, traceId: `${traceRoot}-${row.kind}` }));
}

export function createOperationalSignalBatch(input?: {
  deploymentId?: string;
  timeWindow?: string;
}): OperationalSignalBatch {
  const deploymentId = input?.deploymentId ?? "operational-signals";
  const timeWindow = input?.timeWindow ?? "V3.7-production-window";
  const batchId = `OSB-V4A2-${deploymentId.slice(0, 8)}`;
  const traceRoot = `trace-${batchId}`;
  const observedAt = V4_OPERATION_TIMESTAMP;

  const defaults: NormalizeSignalDefaults = {
    deploymentId,
    traceRoot,
    observedAt,
  };

  const rawInputs = collectRawSignalInputs(deploymentId, traceRoot);
  const signals = normalizeSignalBatch(rawInputs, defaults);

  const throughput = signals.find((s) => s.kind === "throughput")?.value ?? 0;
  const errorRate = signals.find((s) => s.kind === "errorRate")?.value ?? 0;
  const successRatio = signals.find((s) => s.kind === "successRatio")?.value ?? 0;

  return {
    version: V4A2_INTELLIGENCE_VERSION,
    batchId,
    deploymentId,
    signals,
    collectedAt: observedAt,
    timeWindow,
    summary: `operational-signals id=${batchId} count=${signals.length} window=${timeWindow} throughput=${throughput.toFixed(0)} errorRate=${errorRate.toFixed(0)} success=${successRatio.toFixed(0)}`,
  };
}

/** @deprecated Use createOperationalSignalBatch */
export function buildOperationalSignalBatch(input?: {
  deploymentId?: string;
}): OperationalSignalBatch {
  return createOperationalSignalBatch(input);
}

export function getSignalByKind(
  batch: OperationalSignalBatch,
  kind: OperationalSignalKind,
): OperationalSignal | undefined {
  return batch.signals.find((s) => s.kind === kind);
}
