/**
 * Operations O4 — Forecast types + readiness / manifest
 */

import type {
  FORECAST_HORIZONS,
  O4_MANAGER_STATUSES,
  O4_READINESS_VERDICTS,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
} from "../growth/growth.constants";

export type ForecastHorizon = (typeof FORECAST_HORIZONS)[number];
export type O4ReadinessVerdict = (typeof O4_READINESS_VERDICTS)[number];
export type O4ManagerStatus = (typeof O4_MANAGER_STATUSES)[number];
export type ForecastMetadata = Record<string, unknown>;

export type ForecastModel = {
  id: string;
  name: string;
  horizon: ForecastHorizon;
  baselineValue: number;
  growthRate: number;
  detail: string;
  metadata: ForecastMetadata;
  createdAt: string;
};

export type RegisterForecastModelInput = {
  id?: string;
  name: string;
  horizon: ForecastHorizon;
  baselineValue: number;
  growthRate: number;
  metadata?: ForecastMetadata;
};

export type ForecastPrediction = {
  id: string;
  modelId: string;
  accountRef: string;
  predictedValue: number;
  confidence: number;
  detail: string;
  predictedAt: string;
};

export type RunForecastPredictionInput = {
  id?: string;
  modelId: string;
  accountRef: string;
};

export type O4ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type O4ReadinessResult = {
  verdict: O4ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: O4ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type O4RegistryManifest = {
  foundationId: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID;
  version: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION;
  freezeVersion: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION;
  base: typeof OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE;
  growthMetricsCount: number;
  growthTrackingCount: number;
  retentionScoreCount: number;
  retentionAnalysisCount: number;
  expansionSignalCount: number;
  expansionOpportunityCount: number;
  cohortAnalysisCount: number;
  cohortReportCount: number;
  forecastModelCount: number;
  forecastPredictionCount: number;
};
