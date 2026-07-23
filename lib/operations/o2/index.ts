/**
 * Operations O2 — Usage Intelligence Foundation public exports
 * Isolated namespace: lib/operations/o2
 */

export {
  ACTIVITY_EVENT_KINDS,
  FEATURE_ADOPTION_LEVELS,
  O2_MANAGER_STATUSES,
  O2_READINESS_VERDICTS,
  OPERATIONS_O2_USAGE_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_BASE,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_FREEZE_VERSION,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_ID,
  OPERATIONS_O2_USAGE_INTELLIGENCE_FOUNDATION_VERSION,
  REPORT_KINDS,
  USAGE_STREAM_KINDS,
  VALUE_BANDS,
} from "./usage/usage.constants";

export type {
  RegisterUsageStreamInput,
  TrackUsageInput,
  UsageMetadata,
  UsageStream,
  UsageStreamKind,
  UsageTracking,
} from "./usage/usage.types";

export {
  clearUsageStreams,
  getUsageStream,
  listUsageStreams,
  registerUsageStream,
} from "./usage/usage.registry";

export {
  clearUsageTracking,
  getUsageTracking,
  listUsageTracking,
  trackUsage,
} from "./usage/usage.tracking";

export type {
  ComputeFeatureMetricsInput,
  FeatureAdoption,
  FeatureAdoptionLevel,
  FeatureMetadata,
  FeatureMetrics,
  RecordFeatureAdoptionInput,
} from "./feature/feature.types";

export {
  clearFeatureAdoptions,
  getFeatureAdoption,
  listFeatureAdoptions,
  recordFeatureAdoption,
} from "./feature/feature.adoption";

export {
  clearFeatureMetrics,
  computeFeatureMetrics,
  getFeatureMetrics,
  listFeatureMetrics,
} from "./feature/feature.metrics";

export type {
  ActivityAnalytics,
  ActivityEvent,
  ActivityEventKind,
  ActivityMetadata,
  AnalyzeActivityInput,
  RecordActivityEventInput,
} from "./activity/activity.types";

export {
  clearActivityEvents,
  getActivityEvent,
  listActivityEvents,
  recordActivityEvent,
} from "./activity/activity.event";

export {
  analyzeActivity,
  clearActivityAnalytics,
  getActivityAnalytics,
  listActivityAnalytics,
} from "./activity/activity.analytics";

export type {
  RecordValueMetricsInput,
  ScoreAccountValueInput,
  ValueBand,
  ValueMetadata,
  ValueMetrics,
  ValueScore,
} from "./value/value.types";

export {
  clearValueMetrics,
  getValueMetrics,
  listValueMetrics,
  recordValueMetrics,
} from "./value/value.metrics";

export {
  clearValueScores,
  getValueScore,
  listValueScores,
  scoreAccountValue,
} from "./value/value.score";

export type {
  GenerateUsageReportInput,
  O2ManagerStatus,
  O2ReadinessCheck,
  O2ReadinessResult,
  O2ReadinessVerdict,
  O2RegistryManifest,
  ReportKind,
  UsageIntelligenceReport,
} from "./report/report.types";

export {
  clearUsageReports,
  generateUsageReport,
  getUsageReport,
  listUsageReports,
} from "./report/report.generator";

export {
  assertO2UsageIntelligenceReadinessReady,
  evaluateO2UsageIntelligenceReadiness,
} from "./report/report.readiness";

export {
  clearO2UsageIntelligenceLayer,
  createO2UsageIntelligenceManager,
  getO2RegistryManifest,
  type O2UsageIntelligenceManager,
  type O2UsageIntelligenceManagerSnapshot,
} from "./usage.manager";

export {
  assertOperationsO2ReleaseGatePass,
  checkOperationsO2ReleaseGate,
  OPERATIONS_O2_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/operations.release.gate";
