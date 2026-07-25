/**
 * Product Customer Insight — Recommendation types
 */

import type { INSIGHT_RECOMMENDATION_KINDS } from "../insight/insight.constants";

export type InsightRecommendationKind =
  (typeof INSIGHT_RECOMMENDATION_KINDS)[number];
export type RecommendationMetadata = Record<string, unknown>;

export type CustomerInsightRecommendation = {
  id: string;
  customerId: string;
  kind: InsightRecommendationKind;
  action: string;
  detail: string;
  metadata: RecommendationMetadata;
  recommendedAt: string;
};

export type IssueRecommendationInput = {
  id?: string;
  customerId: string;
  kind: InsightRecommendationKind;
  action: string;
  metadata?: RecommendationMetadata;
};
