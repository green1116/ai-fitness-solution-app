/**
 * Product Forecast — Series types
 */

import type { SERIES_GRANULARITIES } from "../trend/trend.constants";

export type SeriesGranularity = (typeof SERIES_GRANULARITIES)[number];
export type SeriesMetadata = Record<string, unknown>;

export type ForecastSeries = {
  id: string;
  modelId: string;
  granularity: SeriesGranularity;
  pointCount: number;
  detail: string;
  metadata: SeriesMetadata;
  ingestedAt: string;
};

export type IngestSeriesInput = {
  id?: string;
  modelId: string;
  granularity: SeriesGranularity;
  pointCount: number;
  metadata?: SeriesMetadata;
};
