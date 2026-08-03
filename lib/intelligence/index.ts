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
