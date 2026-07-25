/**
 * Product Forecast — Trend signal types
 */

import type { TREND_DIRECTIONS } from "../trend/trend.constants";

export type TrendDirection = (typeof TREND_DIRECTIONS)[number];
export type TrendSignalMetadata = Record<string, unknown>;

export type ForecastTrendSignal = {
  id: string;
  projectionId: string;
  direction: TrendDirection;
  slope: number;
  detail: string;
  metadata: TrendSignalMetadata;
  detectedAt: string;
};

export type DetectTrendInput = {
  id?: string;
  projectionId: string;
  direction: TrendDirection;
  slope: number;
  metadata?: TrendSignalMetadata;
};
