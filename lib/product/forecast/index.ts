/**
 * Product Forecast — Forecast Trend public exports
 * Isolated namespace: lib/product/forecast
 */

export {
  FORECAST_MANAGER_STATUSES,
  FORECAST_MODEL_KINDS,
  FORECAST_READINESS_VERDICTS,
  PRODUCT_FORECAST_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_BASE,
  PRODUCT_FORECAST_TREND_FREEZE_VERSION,
  PRODUCT_FORECAST_TREND_ID,
  PRODUCT_FORECAST_TREND_VERSION,
  PROJECTION_HORIZONS,
  SERIES_GRANULARITIES,
  TREND_DIRECTIONS,
} from "./trend/trend.constants";

export type {
  ForecastManagerStatus,
  ForecastReadinessCheck,
  ForecastReadinessResult,
  ForecastReadinessVerdict,
  ForecastRegistryManifest,
} from "./trend/trend.types";

export type {
  ForecastModel,
  ForecastModelKind,
  ModelMetadata,
  RegisterModelInput,
} from "./model/model.types";

export {
  clearModels,
  getModel,
  listModels,
  registerModel,
} from "./model/model.registry";

export type {
  ForecastSeries,
  IngestSeriesInput,
  SeriesGranularity,
  SeriesMetadata,
} from "./series/series.types";

export {
  clearSeries,
  getSeries,
  ingestSeries,
  listSeries,
} from "./series/series.registry";

export type {
  ForecastProjection,
  ProjectForecastInput,
  ProjectionHorizon,
  ProjectionMetadata,
} from "./projection/projection.types";

export {
  clearProjections,
  getProjection,
  listProjections,
  projectForecast,
} from "./projection/projection.registry";

export type {
  DetectTrendInput,
  ForecastTrendSignal,
  TrendDirection,
  TrendSignalMetadata,
} from "./signal/signal.types";

export {
  clearTrendSignals,
  detectTrend,
  getTrendSignal,
  listTrendSignals,
} from "./signal/signal.registry";

export {
  assertForecastTrendReadinessReady,
  evaluateForecastTrendReadiness,
} from "./trend/trend.readiness";

export {
  clearForecastTrendLayer,
  createForecastManager,
  getForecastRegistryManifest,
  type ForecastManager,
  type ForecastManagerSnapshot,
} from "./forecast.manager";

export {
  assertProductForecastReleaseGatePass,
  checkProductForecastReleaseGate,
  PRODUCT_FORECAST_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
