/**
 * Product Analytics — Analytics Foundation public exports
 * Isolated namespace: lib/product/analytics
 */

export {
  ANALYTICS_MANAGER_STATUSES,
  ANALYTICS_READINESS_VERDICTS,
  DATASET_STATUSES,
  METRIC_KINDS,
  PIPELINE_STATUSES,
  PRODUCT_ANALYTICS_FOUNDATION_BASE,
  PRODUCT_ANALYTICS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_ANALYTICS_FOUNDATION_ID,
  PRODUCT_ANALYTICS_FOUNDATION_VERSION,
  PRODUCT_ANALYTICS_FREEZE_VERSION,
  REPORT_KINDS,
} from "./foundation/foundation.constants";

export type {
  AnalyticsManagerStatus,
  AnalyticsReadinessCheck,
  AnalyticsReadinessResult,
  AnalyticsReadinessVerdict,
  AnalyticsRegistryManifest,
} from "./foundation/foundation.types";

export type {
  AnalyticsMetric,
  MetricKind,
  MetricMetadata,
  RegisterMetricInput,
} from "./metric/metric.types";

export {
  clearMetrics,
  getMetric,
  listMetrics,
  registerMetric,
} from "./metric/metric.registry";

export type {
  AnalyticsDataset,
  DatasetMetadata,
  DatasetStatus,
  RegisterDatasetInput,
  UpdateDatasetStatusInput,
} from "./dataset/dataset.types";

export {
  clearDatasets,
  getDataset,
  listDatasets,
  registerDataset,
  updateDatasetStatus,
} from "./dataset/dataset.registry";

export type {
  AnalyticsPipeline,
  CreatePipelineInput,
  PipelineMetadata,
  PipelineStatus,
  RunPipelineInput,
} from "./pipeline/pipeline.types";

export {
  clearPipelines,
  createPipeline,
  getPipeline,
  listPipelines,
  runPipeline,
} from "./pipeline/pipeline.registry";

export type {
  AnalyticsReport,
  GenerateReportInput,
  ReportKind,
  ReportMetadata,
} from "./report/report.types";

export {
  clearReports,
  generateReport,
  getReport,
  listReports,
} from "./report/report.registry";

export {
  assertAnalyticsFoundationReadinessReady,
  evaluateAnalyticsFoundationReadiness,
} from "./foundation/foundation.readiness";

export {
  clearAnalyticsFoundationLayer,
  createAnalyticsManager,
  getAnalyticsRegistryManifest,
  type AnalyticsManager,
  type AnalyticsManagerSnapshot,
} from "./analytics.manager";

export {
  assertProductAnalyticsReleaseGatePass,
  checkProductAnalyticsReleaseGate,
  PRODUCT_ANALYTICS_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/product.release.gate";
