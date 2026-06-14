import type { RegistryValidation } from "../shared/types";

export const INDUSTRY_RECOMMENDATION_VERSION = "v31-industry-recommendation-1" as const;
export const INDUSTRY_RECOMMENDATION_TAG = "v31-industry-recommendation-foundation" as const;

export type IndustryRecommendationMode = "industry-recommendation";

export type RecommendationCandidateKind =
  | "similar-organization"
  | "supplier"
  | "brand"
  | "relationship"
  | "category-match";

export type RecommendationEntityType = "organization" | "directory-entry" | "relationship-type";

export interface RecommendationCandidate {
  candidateId: string;
  entityId: string;
  entityType: RecommendationEntityType;
  displayName: string;
  candidateKind: RecommendationCandidateKind;
  mode: IndustryRecommendationMode;
}

export interface RecommendationScore {
  scoreId: string;
  candidateId: string;
  score: number;
  confidence: number;
  reasons: string[];
  signals: Record<string, number>;
  mode: IndustryRecommendationMode;
}

export interface RecommendationContext {
  contextId: string;
  anchorId: string;
  candidates: RecommendationCandidate[];
  scores: RecommendationScore[];
  recommendationReady: boolean;
  mode: IndustryRecommendationMode;
}

export interface RecommendationQuery {
  anchorId?: string;
  categoryId?: string;
  categoryCode?: string;
  limit?: number;
  recommendationType?: "similar" | "supplier" | "brand" | "relationship" | "category";
}

export interface RecommendationQueryResult {
  queryId: string;
  query: RecommendationQuery;
  candidates: RecommendationCandidate[];
  scores: RecommendationScore[];
  hitCount: number;
  recommendationReady: boolean;
}

export interface IndustryRecommendationValidation {
  valid: boolean;
  recommendationEngine: RegistryValidation;
  recommendationContext: RegistryValidation;
  recommendationQuery: RegistryValidation;
}

export const CANONICAL_RECOMMENDATION_ANCHOR = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_RECOMMENDATION_QUERY: RecommendationQuery = {
  anchorId: CANONICAL_RECOMMENDATION_ANCHOR,
  recommendationType: "supplier",
  limit: 5,
} as const;

export const CANONICAL_CATEGORY_RECOMMENDATION_QUERY: RecommendationQuery = {
  categoryCode: "COMMERCIAL_GYM",
  recommendationType: "category",
  limit: 5,
} as const;
