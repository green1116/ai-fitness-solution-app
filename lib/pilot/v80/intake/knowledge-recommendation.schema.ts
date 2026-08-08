/**
 * V80 Pilot P14 — Knowledge recommendation engine schema (deterministic, governed)
 */

export const KNOWLEDGE_RECOMMENDATION_VERSION = "v80-pilot-p14-recommend-1";

export type RecommendationCategory =
  | "requirement_template"
  | "clarification"
  | "compliance"
  | "equipment_spec"
  | "best_practice"
  | "alternative";

export type RecommendationFeedbackStatus = "open" | "accepted" | "dismissed";

export type RecommendationRankWeights = {
  similarity: number;
  trust: number;
  frequency: number;
  category: number;
  effectiveness: number;
};

/** Default ranking strategy weights (must sum conceptually; applied as weighted sum) */
export const DEFAULT_RANK_WEIGHTS: RecommendationRankWeights = {
  similarity: 0.35,
  trust: 0.4,
  frequency: 0.15,
  category: 0.1,
  effectiveness: 0.08,
};

export type RankedKnowledgeRecommendation = {
  id: string;
  patternId: string;
  category: RecommendationCategory;
  kind: string;
  title: string;
  /** Primary actionable text */
  primary: string;
  /** Same-kind alternatives from governed library */
  alternatives: string[];
  /** Best-practice note when authority is promoted/canonical */
  bestPractice?: string;
  reason: string;
  relatedFieldPath?: string;
  /** Token/Jaccard similarity to current intake context */
  similarity: number;
  trustScore: number;
  frequencyNorm: number;
  categoryBoost: number;
  effectivenessBoost: number;
  /** Final deterministic rank score */
  rankScore: number;
  confidence: number;
  trust?: {
    band: string;
    score: number;
    authority: string;
    freshness: string;
    status: string;
    labels: string[];
    fallback?: boolean;
  };
  status: RecommendationFeedbackStatus;
  acceptedAt?: string;
  dismissedAt?: string;
  dismissReason?: string;
  acceptedBy?: string;
  dismissedBy?: string;
};

export type KnowledgeRecommendationPack = {
  version: typeof KNOWLEDGE_RECOMMENDATION_VERSION;
  organizationId: string;
  sessionId: string;
  generatedAt: string;
  contentHash: string;
  libraryHash?: string;
  governanceRevision?: number;
  ranking: {
    strategy: "weighted_similarity_trust_v1";
    weights: RecommendationRankWeights;
  };
  items: RankedKnowledgeRecommendation[];
  summary: {
    total: number;
    open: number;
    accepted: number;
    dismissed: number;
    byCategory: Record<string, number>;
  };
};

export type RecommendationFeedbackEvent = {
  id: string;
  organizationId: string;
  sessionId: string;
  recommendationId: string;
  patternId: string;
  action: "accepted" | "dismissed" | "reopened";
  at: string;
  actorId: string;
  note?: string;
  appliedToRequirements?: boolean;
};

export type PatternEffectivenessStats = {
  patternId: string;
  shown: number;
  accepted: number;
  dismissed: number;
  acceptRate: number;
};

export type OrgRecommendationEffectiveness = {
  organizationId: string;
  updatedAt: string;
  events: RecommendationFeedbackEvent[];
  byPatternId: Record<string, PatternEffectivenessStats>;
  totals: {
    shown: number;
    accepted: number;
    dismissed: number;
    acceptRate: number;
  };
};
