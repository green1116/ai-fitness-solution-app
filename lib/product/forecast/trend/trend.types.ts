/**
 * Product Forecast — readiness / manifest types
 */

import type {
  FORECAST_MANAGER_STATUSES,
  FORECAST_READINESS_VERDICTS,
  PRODUCT_FORECAST_TREND_BASE,
  PRODUCT_FORECAST_TREND_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_ID,
  PRODUCT_FORECAST_TREND_VERSION,
} from "./trend.constants";

export type ForecastReadinessVerdict =
  (typeof FORECAST_READINESS_VERDICTS)[number];
export type ForecastManagerStatus =
  (typeof FORECAST_MANAGER_STATUSES)[number];

export type ForecastReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ForecastReadinessResult = {
  verdict: ForecastReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ForecastReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ForecastRegistryManifest = {
  trendId: typeof PRODUCT_FORECAST_TREND_ID;
  version: typeof PRODUCT_FORECAST_TREND_VERSION;
  freezeVersion: typeof PRODUCT_FORECAST_TREND_FREEZE_VERSION;
  base: typeof PRODUCT_FORECAST_TREND_BASE;
  modelCount: number;
  seriesCount: number;
  projectionCount: number;
  trendCount: number;
};
