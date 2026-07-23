/**
 * Commercialization P6 — Revenue Intelligence public exports
 * Isolated namespace: lib/commercialization/p6
 */

export {
  COMMERCIALIZATION_P6_REVENUE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_BASE,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_FREEZE_VERSION,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_ID,
  COMMERCIALIZATION_REVENUE_INTELLIGENCE_VERSION,
  HEALTH_BANDS,
  KPI_CATEGORIES,
  REPORT_KINDS,
  REVENUE_MANAGER_STATUSES,
  REVENUE_PERIODS,
  REVENUE_READINESS_VERDICTS,
  REVENUE_STREAM_KINDS,
} from "./kpi/kpi.constants";

export type {
  ComputeRevenueMetricsInput,
  RegisterRevenueStreamInput,
  RevenueMetrics,
  RevenuePeriod,
  RevenueStream,
  RevenueStreamKind,
} from "./revenue/revenue.types";

export {
  clearRevenueStreams,
  getRevenueStream,
  listRevenueStreams,
  registerRevenueStream,
} from "./revenue/revenue.registry";

export {
  clearRevenueMetrics,
  computeRevenueMetrics,
  getRevenueMetrics,
  listRevenueMetrics,
} from "./revenue/revenue.metrics";

export type {
  AnalyticsCalculation,
  AnalyticsSnapshot,
  CalculateAnalyticsInput,
  RunAnalyticsInput,
} from "./analytics/analytics.types";

export {
  clearAnalyticsSnapshots,
  getAnalyticsSnapshot,
  listAnalyticsSnapshots,
  runRevenueAnalytics,
} from "./analytics/analytics.engine";

export {
  calculateAnalyticsMetric,
  clearAnalyticsCalculations,
  getAnalyticsCalculation,
  listAnalyticsCalculations,
} from "./analytics/analytics.calculator";

export type {
  KpiCategory,
  RegisterKpiInput,
  RevenueKpi,
} from "./kpi/kpi.types";

export {
  clearRevenueKpis,
  getRevenueKpi,
  listRevenueKpis,
  registerKpi,
} from "./kpi/kpi.registry";

export type {
  AssessCustomerHealthInput,
  CaptureCustomerValueInput,
  CustomerHealthProfile,
  CustomerScoreCard,
  CustomerValueProfile,
  HealthBand,
  ScoreCustomerInput,
} from "./customer/customer.types";

export {
  captureCustomerValue,
  clearCustomerValueProfiles,
  getCustomerValueProfile,
  listCustomerValueProfiles,
} from "./customer/customer.value";

export {
  assessCustomerHealth,
  clearCustomerHealthProfiles,
  getCustomerHealthProfile,
  listCustomerHealthProfiles,
} from "./customer/customer.health";

export {
  clearCustomerScoreCards,
  getCustomerScoreCard,
  listCustomerScoreCards,
  scoreCustomer,
} from "./customer/customer.score";

export type {
  GenerateReportInput,
  ReportKind,
  RevenueManagerStatus,
  RevenueReadinessCheck,
  RevenueReadinessResult,
  RevenueReadinessVerdict,
  RevenueRegistryManifest,
  RevenueReport,
} from "./report/report.types";

export {
  clearRevenueReports,
  generateRevenueReport,
  getRevenueReport,
  listRevenueReports,
} from "./report/report.generator";

export {
  assertRevenueIntelligenceReadinessReady,
  evaluateRevenueIntelligenceReadiness,
} from "./report/report.readiness";

export {
  clearRevenueIntelligenceLayer,
  createRevenueIntelligenceManager,
  getRevenueRegistryManifest,
  type RevenueIntelligenceManager,
  type RevenueIntelligenceManagerSnapshot,
} from "./revenue.manager";

export {
  assertCommercializationP6ReleaseGatePass,
  checkCommercializationP6ReleaseGate,
  COMMERCIALIZATION_P6_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/commercialization.release.gate";
