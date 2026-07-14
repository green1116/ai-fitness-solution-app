/**
 * E05-P4 — Forecasting Runtime types
 * Prediction layer above KPI intelligence
 */

import {
  E05_FORECAST_BASE,
  E05_FORECAST_FREEZE_VERSION,
  E05_FORECAST_RUNTIME_ID,
  E05_FORECAST_VERSION,
  FORECAST_DIRECTIONS,
  FORECAST_HORIZONS,
  FORECAST_MODEL_KINDS,
} from "./forecast.constants";

export type ForecastHorizon = (typeof FORECAST_HORIZONS)[number];
export type ForecastDirection = (typeof FORECAST_DIRECTIONS)[number];
export type ForecastModelKind = (typeof FORECAST_MODEL_KINDS)[number];

export type ForecastDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E05 KPI id */
  kpiId: string;
  modelKind: ForecastModelKind;
  horizon: ForecastHorizon;
  steps: number;
  optional: boolean;
  readOnly: true;
};

export type ForecastPoint = {
  step: number;
  value: number;
  readOnly: true;
};

export type ForecastProjection = {
  forecastId: string;
  kpiId: string;
  modelKind: ForecastModelKind;
  horizon: ForecastHorizon;
  baseline: number;
  projected: number;
  direction: ForecastDirection;
  confidence: number;
  points: ForecastPoint[];
  narrative: string;
  readOnly: true;
};

export type ForecastExecutionResult = {
  success: boolean;
  forecastId: string;
  kpiId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  projection: ForecastProjection;
  kpiOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type ForecastRegistryManifest = {
  runtimeId: typeof E05_FORECAST_RUNTIME_ID;
  version: typeof E05_FORECAST_VERSION;
  freezeVersion: typeof E05_FORECAST_FREEZE_VERSION;
  base: typeof E05_FORECAST_BASE;
  forecastCount: number;
  forecasts: ForecastDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
