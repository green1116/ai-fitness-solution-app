/**
 * Operations O4 — Growth Analytics Foundation public exports
 * Isolated namespace: lib/operations/o4
 */

export {
  COHORT_PERIODS,
  EXPANSION_SIGNAL_KINDS,
  FORECAST_HORIZONS,
  GROWTH_METRIC_KINDS,
  O4_MANAGER_STATUSES,
  O4_READINESS_VERDICTS,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_BASE,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_ID,
  OPERATIONS_O4_GROWTH_ANALYTICS_FOUNDATION_VERSION,
  OPERATIONS_O4_GROWTH_FREEZE_VERSION,
  RETENTION_BANDS,
} from "./growth/growth.constants";

export type {
  GrowthMetadata,
  GrowthMetricKind,
  GrowthMetrics,
  GrowthTracking,
  RecordGrowthMetricsInput,
  TrackGrowthInput,
} from "./growth/growth.types";

export {
  clearGrowthMetrics,
  getGrowthMetrics,
  listGrowthMetrics,
  recordGrowthMetrics,
} from "./growth/growth.metrics";

export {
  clearGrowthTracking,
  getGrowthTracking,
  listGrowthTracking,
  trackGrowth,
} from "./growth/growth.tracker";

export type {
  AnalyzeRetentionInput,
  RetentionAnalysis,
  RetentionBand,
  RetentionMetadata,
  RetentionScore,
  ScoreRetentionInput,
} from "./retention/retention.types";

export {
  clearRetentionScores,
  getRetentionScore,
  listRetentionScores,
  scoreRetention,
} from "./retention/retention.score";

export {
  analyzeRetention,
  clearRetentionAnalyses,
  getRetentionAnalysis,
  listRetentionAnalyses,
} from "./retention/retention.analysis";

export type {
  CreateExpansionOpportunityInput,
  DetectExpansionSignalInput,
  ExpansionMetadata,
  ExpansionOpportunity,
  ExpansionSignal,
  ExpansionSignalKind,
} from "./expansion/expansion.types";

export {
  clearExpansionSignals,
  detectExpansionSignal,
  getExpansionSignal,
  listExpansionSignals,
} from "./expansion/expansion.signal";

export {
  clearExpansionOpportunities,
  createExpansionOpportunity,
  getExpansionOpportunity,
  listExpansionOpportunities,
} from "./expansion/expansion.opportunity";

export type {
  AnalyzeCohortInput,
  CohortAnalysis,
  CohortMetadata,
  CohortPeriod,
  CohortReport,
  GenerateCohortReportInput,
} from "./cohort/cohort.types";

export {
  analyzeCohort,
  clearCohortAnalyses,
  getCohortAnalysis,
  listCohortAnalyses,
} from "./cohort/cohort.analysis";

export {
  clearCohortReports,
  generateCohortReport,
  getCohortReport,
  listCohortReports,
} from "./cohort/cohort.report";

export type {
  ForecastHorizon,
  ForecastMetadata,
  ForecastModel,
  ForecastPrediction,
  O4ManagerStatus,
  O4ReadinessCheck,
  O4ReadinessResult,
  O4ReadinessVerdict,
  O4RegistryManifest,
  RegisterForecastModelInput,
  RunForecastPredictionInput,
} from "./forecast/forecast.types";

export {
  clearForecastModels,
  getForecastModel,
  listForecastModels,
  registerForecastModel,
} from "./forecast/forecast.model";

export {
  clearForecastPredictions,
  getForecastPrediction,
  listForecastPredictions,
  runForecastPrediction,
} from "./forecast/forecast.prediction";

export {
  assertO4GrowthAnalyticsReadinessReady,
  evaluateO4GrowthAnalyticsReadiness,
} from "./forecast/forecast.readiness";

export {
  clearO4GrowthAnalyticsLayer,
  createO4GrowthAnalyticsManager,
  getO4RegistryManifest,
  type O4GrowthAnalyticsManager,
  type O4GrowthAnalyticsManagerSnapshot,
} from "./growth.manager";

export {
  assertOperationsO4ReleaseGatePass,
  checkOperationsO4ReleaseGate,
  OPERATIONS_O4_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/operations.release.gate";
