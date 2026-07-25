/**
 * Product Forecast — Model types
 */

import type { FORECAST_MODEL_KINDS } from "../trend/trend.constants";

export type ForecastModelKind = (typeof FORECAST_MODEL_KINDS)[number];
export type ModelMetadata = Record<string, unknown>;

export type ForecastModel = {
  id: string;
  code: string;
  kind: ForecastModelKind;
  metricId: string;
  detail: string;
  metadata: ModelMetadata;
  createdAt: string;
};

export type RegisterModelInput = {
  id?: string;
  code: string;
  kind: ForecastModelKind;
  metricId: string;
  metadata?: ModelMetadata;
};
