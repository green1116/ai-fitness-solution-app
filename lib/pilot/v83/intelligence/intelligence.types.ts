/**
 * V83 — Delivery intelligence & optimization types
 */

export const V83_DELIVERY_INTELLIGENCE_VERSION = "v83-delivery-intelligence-1";

export type InsightPattern =
  | "sla_risk"
  | "failed_delivery"
  | "slow_open"
  | "slow_download";

export type RecommendationAction =
  | "follow_up_needed"
  | "retry_delivery"
  | "escalate_to_admin"
  | "customer_success_action";

export type PriorityLevel = "high" | "medium" | "low";

export type DueBucket = "due_now" | "soon" | "later";

export type DeliveryInsight = {
  id: string;
  pattern: InsightPattern;
  title: string;
  description: string;
  sessionIds: string[];
  count: number;
  readOnly: true;
};

export type DeliveryRecommendation = {
  id: string;
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  action: RecommendationAction;
  priority: PriorityLevel;
  due: DueBucket;
  score: number;
  title: string;
  reason: string;
  drilldownPath: string;
  readOnly: true;
};

export type RankedSession = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  priority: PriorityLevel;
  due: DueBucket;
  score: number;
  topAction: RecommendationAction;
  patterns: InsightPattern[];
  slaStatus: string;
  recommendations: DeliveryRecommendation[];
  readOnly: true;
};

export type SessionIntelligenceDetail = {
  sessionId: string;
  releasePackageId?: string;
  projectName?: string;
  insights: DeliveryInsight[];
  recommendations: DeliveryRecommendation[];
  ranked: RankedSession;
  timelinePath: string;
  analyticsPath: string;
  opsPath: string;
  readOnly: true;
};

export type DeliveryIntelligenceDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  insights: DeliveryInsight[];
  recommendations: DeliveryRecommendation[];
  rankedSessions: RankedSession[];
  summary: {
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    dueNow: number;
    dueSoon: number;
    dueLater: number;
  };
  readOnly: true;
};
