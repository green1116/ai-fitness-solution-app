/**
 * Product Forecast — Projection registry
 */

import { getSeries } from "../series/series.registry";
import { PROJECTION_HORIZONS } from "../trend/trend.constants";
import type {
  ForecastProjection,
  ProjectForecastInput,
  ProjectionHorizon,
} from "./projection.types";

const projections = new Map<string, ForecastProjection>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProjection(
  projection: ForecastProjection,
): ForecastProjection {
  return { ...projection, metadata: { ...projection.metadata } };
}

export function projectForecast(
  input: ProjectForecastInput,
): ForecastProjection {
  const seriesId = input.seriesId.trim();
  if (!seriesId) throw new Error("projection.seriesId is required");
  if (!(PROJECTION_HORIZONS as readonly string[]).includes(input.horizon)) {
    throw new Error(`invalid projection horizon: ${input.horizon}`);
  }
  if (!Number.isFinite(input.predictedValue)) {
    throw new Error("projection.predictedValue must be a number");
  }
  if (
    !Number.isFinite(input.confidence) ||
    input.confidence < 0 ||
    input.confidence > 1
  ) {
    throw new Error("projection.confidence must be between 0 and 1");
  }
  if (!getSeries(seriesId)) throw new Error(`series not found: ${seriesId}`);

  const id = input.id?.trim() || createId("fcstpj");
  if (projections.has(id)) {
    throw new Error(`projection already exists: ${id}`);
  }

  const projection: ForecastProjection = {
    id,
    seriesId,
    horizon: input.horizon,
    predictedValue: input.predictedValue,
    confidence: input.confidence,
    detail: `horizon=${input.horizon} value=${input.predictedValue}`,
    metadata: { ...(input.metadata ?? {}) },
    projectedAt: nowIso(),
  };
  projections.set(id, projection);
  return cloneProjection(projection);
}

export function getProjection(id: string): ForecastProjection | undefined {
  const projection = projections.get(id.trim());
  return projection ? cloneProjection(projection) : undefined;
}

export function listProjections(filter?: {
  seriesId?: string;
  horizon?: ProjectionHorizon;
}): ForecastProjection[] {
  let result = [...projections.values()];
  if (filter?.seriesId) {
    const seriesId = filter.seriesId.trim();
    result = result.filter((p) => p.seriesId === seriesId);
  }
  if (filter?.horizon) {
    result = result.filter((p) => p.horizon === filter.horizon);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProjection);
}

export function clearProjections(): void {
  projections.clear();
}
