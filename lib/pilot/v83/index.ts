/**
 * V83 — Delivery intelligence & optimization
 */

export {
  V83_DELIVERY_INTELLIGENCE_VERSION,
  type DeliveryInsight,
  type DeliveryIntelligenceDashboard,
  type DeliveryRecommendation,
  type DueBucket,
  type InsightPattern,
  type PriorityLevel,
  type RankedSession,
  type RecommendationAction,
  type SessionIntelligenceDetail,
} from "./intelligence/intelligence.types";

export { buildDeliveryInsights, rankSessionsBySlaRisk } from "./intelligence/insight.service";

export { scoreSessionPriority, comparePriority, type PriorityScore } from "./intelligence/priority.service";

export {
  buildOrgRecommendations,
  buildRankedSession,
  buildRankedSessions,
  buildSessionRecommendations,
} from "./intelligence/recommendation.service";

export {
  buildDeliveryIntelligenceDashboard,
  buildSessionIntelligenceDetail,
  getSessionTimelineForDrilldown,
} from "./intelligence/optimization.service";
