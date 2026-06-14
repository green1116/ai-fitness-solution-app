import type { IndustryMarketplaceType } from "@/lib/industry-marketplace";

export const INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION =
  "v35-industry-marketplace-intelligence-1" as const;
export const INDUSTRY_MARKETPLACE_INTELLIGENCE_TAG =
  "v35-industry-marketplace-intelligence-foundation" as const;

export type IndustryMarketplaceIntelligenceMode = "industry-marketplace-intelligence";

export type MarketplaceRankingDimension = "opportunity" | "matching" | "conversion" | "retention";

export type MarketplaceRoutingLane = MarketplaceRankingDimension;

export type MarketplacePriorityTier = "high" | "medium" | "low";

export interface MarketplaceSignal {
  signalId: string;
  marketplaceId: string;
  marketplaceType: IndustryMarketplaceType;
  subjectId: string;
  visibilitySignal: number;
  matchingSignal: number;
  transactionSignal: number;
  retentionSignal: number;
  confidenceSignal: number;
  compositeSignalStrength: number;
  mode: IndustryMarketplaceIntelligenceMode;
}

export interface MarketplaceRankingEntry {
  marketplaceId: string;
  marketplaceType: IndustryMarketplaceType;
  subjectId: string;
  rank: number;
  priorityScore: number;
}

export interface MarketplaceRanking {
  rankingId: string;
  dimension: MarketplaceRankingDimension;
  marketplaceType?: IndustryMarketplaceType;
  entries: MarketplaceRankingEntry[];
  rankingReady: boolean;
  mode: IndustryMarketplaceIntelligenceMode;
}

export interface MarketplaceRouting {
  routingId: string;
  marketplaceType: IndustryMarketplaceType;
  targetMarketplaceId: string;
  subjectId: string;
  routingPriority: number;
  routingLane: MarketplaceRoutingLane;
  reason: string;
  mode: IndustryMarketplaceIntelligenceMode;
}

export interface MarketplaceRecommendation {
  recommendationId: string;
  marketplaceId: string;
  marketplaceType: IndustryMarketplaceType;
  subjectId: string;
  priorityTier: MarketplacePriorityTier;
  opportunityPriority: number;
  matchingPriority: number;
  conversionPriority: number;
  retentionPriority: number;
  compositePriority: number;
  reasons: string[];
  mode: IndustryMarketplaceIntelligenceMode;
}

export interface MarketplaceIntelligence {
  intelligenceId: string;
  signals: MarketplaceSignal[];
  rankings: MarketplaceRanking[];
  routings: MarketplaceRouting[];
  recommendations: MarketplaceRecommendation[];
  signalCount: number;
  rankingCount: number;
  routingCount: number;
  recommendationCount: number;
  intelligenceReady: boolean;
  mode: IndustryMarketplaceIntelligenceMode;
}

export interface MarketplaceIntelligenceQuery {
  subjectId?: string;
  marketplaceType?: IndustryMarketplaceType;
  rankingDimension?: MarketplaceRankingDimension;
  limit?: number;
}

export interface MarketplaceIntelligenceQueryResult {
  queryId: string;
  query: MarketplaceIntelligenceQuery;
  recommendations: MarketplaceRecommendation[];
  rankings: MarketplaceRanking[];
  hitCount: number;
  intelligenceReady: boolean;
}

export interface RegistryValidation {
  valid: boolean;
  count: number;
  summary: string;
}

export interface IndustryMarketplaceIntelligenceValidation {
  valid: boolean;
  signalRegistry: RegistryValidation;
  rankingRegistry: RegistryValidation;
  routingRegistry: RegistryValidation;
  recommendationRegistry: RegistryValidation;
  intelligenceRegistry: RegistryValidation;
}

export const CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID = "ind-org-buyer-sh-gym" as const;

export const CANONICAL_MARKETPLACE_INTELLIGENCE_QUERY: MarketplaceIntelligenceQuery = {
  subjectId: CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  marketplaceType: "tender",
  rankingDimension: "opportunity",
  limit: 5,
} as const;

export const TOP_MARKETPLACE_INTELLIGENCE_THRESHOLD = 78 as const;
