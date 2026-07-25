/**
 * Product Forecast — Projection types
 */

import type { PROJECTION_HORIZONS } from "../trend/trend.constants";

export type ProjectionHorizon = (typeof PROJECTION_HORIZONS)[number];
export type ProjectionMetadata = Record<string, unknown>;

export type ForecastProjection = {
  id: string;
  seriesId: string;
  horizon: ProjectionHorizon;
  predictedValue: number;
  confidence: number;
  detail: string;
  metadata: ProjectionMetadata;
  projectedAt: string;
};

export type ProjectForecastInput = {
  id?: string;
  seriesId: string;
  horizon: ProjectionHorizon;
  predictedValue: number;
  confidence: number;
  metadata?: ProjectionMetadata;
};
