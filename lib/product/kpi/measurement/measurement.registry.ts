/**
 * Product KPI — Measurement registry
 */

import { getKpiDefinition } from "../definition/definition.registry";
import { getKpiTarget } from "../target/target.registry";
import type {
  KpiMeasurement,
  MeasurementResult,
  RecordKpiMeasurementInput,
} from "./measurement.types";

const measurements = new Map<string, KpiMeasurement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function resolveResult(actual: number, target: number): MeasurementResult {
  if (actual < target * 0.95) return "BELOW";
  if (actual > target * 1.05) return "ABOVE";
  return "ON_TRACK";
}

function cloneMeasurement(measurement: KpiMeasurement): KpiMeasurement {
  return { ...measurement, metadata: { ...measurement.metadata } };
}

export function recordKpiMeasurement(
  input: RecordKpiMeasurementInput,
): KpiMeasurement {
  const kpiId = input.kpiId.trim();
  const targetId = input.targetId.trim();
  if (!kpiId) throw new Error("measurement.kpiId is required");
  if (!targetId) throw new Error("measurement.targetId is required");
  if (!Number.isFinite(input.actual) || input.actual < 0) {
    throw new Error("measurement.actual must be a non-negative number");
  }
  if (!getKpiDefinition(kpiId)) {
    throw new Error(`kpi not found: ${kpiId}`);
  }

  const target = getKpiTarget(targetId);
  if (!target) throw new Error(`kpi target not found: ${targetId}`);
  if (target.kpiId !== kpiId) {
    throw new Error(`target kpi mismatch: ${targetId}/${kpiId}`);
  }

  const id = input.id?.trim() || createId("kpimeas");
  if (measurements.has(id)) {
    throw new Error(`kpi measurement already exists: ${id}`);
  }

  const result = resolveResult(input.actual, target.value);
  const measurement: KpiMeasurement = {
    id,
    kpiId,
    targetId,
    actual: input.actual,
    result,
    detail: `result=${result} actual=${input.actual}`,
    metadata: { ...(input.metadata ?? {}) },
    measuredAt: nowIso(),
  };
  measurements.set(id, measurement);
  return cloneMeasurement(measurement);
}

export function getKpiMeasurement(id: string): KpiMeasurement | undefined {
  const measurement = measurements.get(id.trim());
  return measurement ? cloneMeasurement(measurement) : undefined;
}

export function listKpiMeasurements(filter?: {
  kpiId?: string;
  result?: MeasurementResult;
}): KpiMeasurement[] {
  let result = [...measurements.values()];
  if (filter?.kpiId) {
    const kpiId = filter.kpiId.trim();
    result = result.filter((m) => m.kpiId === kpiId);
  }
  if (filter?.result) {
    result = result.filter((m) => m.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneMeasurement);
}

export function clearKpiMeasurements(): void {
  measurements.clear();
}
