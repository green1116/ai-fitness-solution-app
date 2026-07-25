/**
 * Product Forecast — Series registry
 */

import { getModel } from "../model/model.registry";
import { SERIES_GRANULARITIES } from "../trend/trend.constants";
import type {
  ForecastSeries,
  IngestSeriesInput,
  SeriesGranularity,
} from "./series.types";

const seriesStore = new Map<string, ForecastSeries>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSeries(series: ForecastSeries): ForecastSeries {
  return { ...series, metadata: { ...series.metadata } };
}

export function ingestSeries(input: IngestSeriesInput): ForecastSeries {
  const modelId = input.modelId.trim();
  if (!modelId) throw new Error("series.modelId is required");
  if (
    !(SERIES_GRANULARITIES as readonly string[]).includes(input.granularity)
  ) {
    throw new Error(`invalid series granularity: ${input.granularity}`);
  }
  if (!Number.isFinite(input.pointCount) || input.pointCount < 1) {
    throw new Error("series.pointCount must be >= 1");
  }
  if (!getModel(modelId)) throw new Error(`model not found: ${modelId}`);

  const id = input.id?.trim() || createId("fcstsr");
  if (seriesStore.has(id)) throw new Error(`series already exists: ${id}`);

  const series: ForecastSeries = {
    id,
    modelId,
    granularity: input.granularity,
    pointCount: input.pointCount,
    detail: `granularity=${input.granularity} points=${input.pointCount}`,
    metadata: { ...(input.metadata ?? {}) },
    ingestedAt: nowIso(),
  };
  seriesStore.set(id, series);
  return cloneSeries(series);
}

export function getSeries(id: string): ForecastSeries | undefined {
  const series = seriesStore.get(id.trim());
  return series ? cloneSeries(series) : undefined;
}

export function listSeries(filter?: {
  modelId?: string;
  granularity?: SeriesGranularity;
}): ForecastSeries[] {
  let result = [...seriesStore.values()];
  if (filter?.modelId) {
    const modelId = filter.modelId.trim();
    result = result.filter((s) => s.modelId === modelId);
  }
  if (filter?.granularity) {
    result = result.filter((s) => s.granularity === filter.granularity);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSeries);
}

export function clearSeries(): void {
  seriesStore.clear();
}
