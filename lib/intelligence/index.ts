/**
 * Intelligence domain public exports
 */

export {
  buildIntelligenceContext,
  clearIntelligenceContext,
  FEAT_49_ID,
  getIntelligenceContext,
  INTELLIGENCE_CONTEXT_CAPABILITY,
  type AnalyticsContextSummary,
  type AutomationContextSummary,
  type CustomerContextSummary,
  type IntelligenceContext,
  type OperationsContextSummary,
} from "./context";

export {
  clearIntelligenceSnapshots,
  createIntelligenceSnapshot,
  FEAT_50_ID,
  getIntelligenceSnapshot,
  INTELLIGENCE_SNAPSHOT_CAPABILITY,
  listIntelligenceSnapshots,
  type CreateIntelligenceSnapshotInput,
  type IntelligenceSnapshot,
  type ListIntelligenceSnapshotsFilter,
} from "./snapshot";

export {
  buildIntelligenceMetrics,
  clearIntelligenceMetrics,
  FEAT_51_ID,
  getIntelligenceMetrics,
  INTELLIGENCE_METRICS_CAPABILITY,
  type IntelligenceMetrics,
} from "./metrics";

export {
  buildIntelligenceDashboard,
  clearIntelligenceDashboard,
  FEAT_52_ID,
  getIntelligenceDashboard,
  INTELLIGENCE_DASHBOARD_CAPABILITY,
  INTELLIGENCE_TRENDS,
  type IntelligenceDashboard,
  type IntelligenceTrend,
  // WP-70 Dashboard Engine
  buildDashboard,
  clearDashboard,
  DASHBOARD_ENGINE_CAPABILITY,
  FEAT_71_ID,
  getDashboard,
  type BuildDashboardInput,
  type DashboardItem,
} from "./dashboard";

export {
  buildRecommendations,
  clearRecommendations,
  FEAT_53_ID,
  getRecommendations,
  RECOMMENDATION_ENGINE_CAPABILITY,
  RECOMMENDATION_PRIORITIES,
  RECOMMENDATION_TYPES,
  type Recommendation,
  type RecommendationPriority,
  type RecommendationType,
} from "./recommendation";

export {
  buildInsights,
  clearInsights,
  FEAT_54_ID,
  getInsights,
  INSIGHT_ENGINE_CAPABILITY,
  INSIGHT_SEVERITIES,
  INSIGHT_TYPES,
  type BuildInsightsInput,
  type Insight,
  type InsightSeverity,
  type InsightType,
} from "./insight";

export {
  buildPriorityItems,
  clearPriorityItems,
  FEAT_55_ID,
  getPriorityItems,
  PRIORITY_ENGINE_CAPABILITY,
  PRIORITY_LEVELS,
  PRIORITY_SOURCE_TYPES,
  type BuildPriorityItemsInput,
  type PriorityItem,
  type PriorityLevel,
  type PrioritySourceType,
} from "./priority";

export {
  buildSignals,
  clearSignals,
  FEAT_56_ID,
  getSignals,
  SIGNAL_ENGINE_CAPABILITY,
  SIGNAL_INTENSITIES,
  SIGNAL_SOURCE_TYPES,
  SIGNAL_TYPES,
  type BuildSignalsInput,
  type Signal,
  type SignalIntensity,
  type SignalSourceType,
  type SignalType,
} from "./signal";

export {
  ATTENTION_ENGINE_CAPABILITY,
  ATTENTION_LEVELS,
  buildAttention,
  clearAttention,
  FEAT_57_ID,
  getAttention,
  type AttentionItem,
  type AttentionLevel,
  type BuildAttentionInput,
} from "./attention";

export {
  buildQueue,
  clearQueue,
  FEAT_58_ID,
  getQueue,
  QUEUE_ENGINE_CAPABILITY,
  type BuildQueueInput,
  type QueueItem,
} from "./queue";

export {
  BATCH_ENGINE_CAPABILITY,
  BATCH_SIZE,
  buildBatch,
  clearBatch,
  FEAT_59_ID,
  getBatch,
  type BatchItem,
  type BuildBatchInput,
} from "./batch";

export {
  buildDispatch,
  clearDispatch,
  DISPATCH_ENGINE_CAPABILITY,
  DISPATCH_PRIORITIES,
  FEAT_60_ID,
  getDispatch,
  type BuildDispatchInput,
  type DispatchItem,
  type DispatchPriority,
} from "./dispatch";

export {
  buildRoute,
  clearRoute,
  FEAT_61_ID,
  getRoute,
  ROUTE_ENGINE_CAPABILITY,
  ROUTE_TARGETS,
  type BuildRouteInput,
  type RouteItem,
  type RouteTarget,
} from "./route";

export {
  ASSIGNMENT_ASSIGNEES,
  ASSIGNMENT_ENGINE_CAPABILITY,
  buildAssignment,
  clearAssignment,
  FEAT_62_ID,
  getAssignment,
  type AssignmentAssignee,
  type AssignmentItem,
  type BuildAssignmentInput,
} from "./assignment";

export {
  buildTask,
  clearTask,
  FEAT_63_ID,
  getTask,
  TASK_ENGINE_CAPABILITY,
  TASK_STATUSES,
  type BuildTaskInput,
  type TaskItem,
  type TaskStatus,
} from "./task";

export {
  buildPlan,
  clearPlan,
  FEAT_64_ID,
  getPlan,
  PLAN_ENGINE_CAPABILITY,
  PLAN_STAGES,
  type BuildPlanInput,
  type PlanItem,
  type PlanStage,
} from "./plan";

export {
  buildReview,
  clearReview,
  FEAT_65_ID,
  getReview,
  REVIEW_ENGINE_CAPABILITY,
  REVIEW_STATUSES,
  type BuildReviewInput,
  type ReviewItem,
  type ReviewStatus,
} from "./review";

export {
  APPROVAL_ENGINE_CAPABILITY,
  APPROVAL_STATUSES,
  buildApproval,
  clearApproval,
  FEAT_66_ID,
  getApproval,
  type ApprovalItem,
  type ApprovalStatus,
  type BuildApprovalInput,
} from "./approval";

export {
  buildDecision,
  clearDecision,
  DECISION_ENGINE_CAPABILITY,
  DECISION_OUTCOMES,
  FEAT_67_ID,
  getDecision,
  type BuildDecisionInput,
  type DecisionItem,
  type DecisionOutcome,
} from "./decision";

export {
  buildExecution,
  clearExecution,
  EXECUTION_ACTIONS,
  EXECUTION_ENGINE_CAPABILITY,
  FEAT_68_ID,
  getExecution,
  type BuildExecutionInput,
  type ExecutionAction,
  type ExecutionItem,
} from "./execution";

export {
  ARCHIVE_ENGINE_CAPABILITY,
  ARCHIVE_STATUSES,
  buildArchive,
  clearArchive,
  FEAT_69_ID,
  getArchive,
  type ArchiveItem,
  type ArchiveStatus,
  type BuildArchiveInput,
} from "./archive";

export {
  buildReport,
  clearReport,
  FEAT_70_ID,
  getReport,
  REPORT_ENGINE_CAPABILITY,
  type BuildReportInput,
  type ReportItem,
} from "./report";

export {
  buildExport,
  clearExport,
  EXPORT_ENGINE_CAPABILITY,
  EXPORT_FORMATS,
  FEAT_72_ID,
  getExport,
  type BuildExportInput,
  type ExportFormat,
  type ExportItem,
} from "./export";
