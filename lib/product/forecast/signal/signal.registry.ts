/**
 * Product Forecast — Trend signal registry
 */

import { getProjection } from "../projection/projection.registry";
import { TREND_DIRECTIONS } from "../trend/trend.constants";
import type {
  DetectTrendInput,
  ForecastTrendSignal,
  TrendDirection,
} from "./signal.types";

const signals = new Map<string, ForecastTrendSignal>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSignal(signal: ForecastTrendSignal): ForecastTrendSignal {
  return { ...signal, metadata: { ...signal.metadata } };
}

export function detectTrend(input: DetectTrendInput): ForecastTrendSignal {
  const projectionId = input.projectionId.trim();
  if (!projectionId) throw new Error("trend.projectionId is required");
  if (!(TREND_DIRECTIONS as readonly string[]).includes(input.direction)) {
    throw new Error(`invalid trend direction: ${input.direction}`);
  }
  if (!Number.isFinite(input.slope)) {
    throw new Error("trend.slope must be a number");
  }
  if (!getProjection(projectionId)) {
    throw new Error(`projection not found: ${projectionId}`);
  }

  const id = input.id?.trim() || createId("fcsttr");
  if (signals.has(id)) throw new Error(`trend signal already exists: ${id}`);

  const signal: ForecastTrendSignal = {
    id,
    projectionId,
    direction: input.direction,
    slope: input.slope,
    detail: `direction=${input.direction} slope=${input.slope}`,
    metadata: { ...(input.metadata ?? {}) },
    detectedAt: nowIso(),
  };
  signals.set(id, signal);
  return cloneSignal(signal);
}

export function getTrendSignal(id: string): ForecastTrendSignal | undefined {
  const signal = signals.get(id.trim());
  return signal ? cloneSignal(signal) : undefined;
}

export function listTrendSignals(filter?: {
  direction?: TrendDirection;
  projectionId?: string;
}): ForecastTrendSignal[] {
  let result = [...signals.values()];
  if (filter?.direction) {
    result = result.filter((s) => s.direction === filter.direction);
  }
  if (filter?.projectionId) {
    const projectionId = filter.projectionId.trim();
    result = result.filter((s) => s.projectionId === projectionId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSignal);
}

export function clearTrendSignals(): void {
  signals.clear();
}
