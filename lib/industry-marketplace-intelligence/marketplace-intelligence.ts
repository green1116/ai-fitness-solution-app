import { buildMarketplaceRecommendations, recommendTopMarketplace } from "./marketplace-recommendation";
import { buildAllMarketplaceRankings } from "./marketplace-ranking";
import { buildMarketplaceRouting } from "./marketplace-routing";
import { buildMarketplaceSignals } from "./marketplace-signal";
import type {
  IndustryMarketplaceIntelligenceValidation,
  MarketplaceIntelligence,
  MarketplaceIntelligenceQuery,
  MarketplaceIntelligenceQueryResult,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_MARKETPLACE_INTELLIGENCE_QUERY,
  CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  INDUSTRY_MARKETPLACE_INTELLIGENCE_TAG,
  INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION,
  TOP_MARKETPLACE_INTELLIGENCE_THRESHOLD,
} from "./shared/types";
import { validateMarketplaceRecommendationRegistry } from "./marketplace-recommendation";
import { validateMarketplaceRankingRegistry } from "./marketplace-ranking";
import { validateMarketplaceRoutingRegistry } from "./marketplace-routing";
import { validateMarketplaceSignalRegistry } from "./marketplace-signal";

export function buildMarketplaceIntelligence(): MarketplaceIntelligence {
  const signals = buildMarketplaceSignals();
  const rankings = buildAllMarketplaceRankings(5);
  const routings = buildMarketplaceRouting();
  const recommendations = buildMarketplaceRecommendations();

  return {
    intelligenceId: `marketplace-intelligence-${INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION}`,
    signals,
    rankings,
    routings,
    recommendations,
    signalCount: signals.length,
    rankingCount: rankings.length,
    routingCount: routings.length,
    recommendationCount: recommendations.length,
    intelligenceReady:
      signals.length > 0 &&
      rankings.length >= 4 &&
      routings.length === 4 &&
      recommendations.length > 0,
    mode: "industry-marketplace-intelligence",
  };
}

export function validateMarketplaceIntelligenceState(
  intelligence: MarketplaceIntelligence,
): boolean {
  const canonicalRecommendations = intelligence.recommendations.filter(
    (recommendation) => recommendation.subjectId === CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  );

  return (
    intelligence.intelligenceReady &&
    intelligence.signalCount >= 8 &&
    intelligence.rankingCount >= 4 &&
    intelligence.routingCount === 4 &&
    intelligence.recommendationCount >= 8 &&
    intelligence.signals.length === intelligence.signalCount &&
    intelligence.recommendations.length === intelligence.recommendationCount &&
    canonicalRecommendations.length >= 1 &&
    intelligence.mode === "industry-marketplace-intelligence"
  );
}

export function validateMarketplaceIntelligenceRegistry(): RegistryValidation {
  const intelligence = buildMarketplaceIntelligence();
  const query = validateMarketplaceIntelligenceQueryRegistry();
  const valid =
    validateMarketplaceIntelligenceState(intelligence) &&
    query.valid &&
    INDUSTRY_MARKETPLACE_INTELLIGENCE_VERSION === "v35-industry-marketplace-intelligence-1" &&
    INDUSTRY_MARKETPLACE_INTELLIGENCE_TAG === "v35-industry-marketplace-intelligence-foundation";

  return {
    valid,
    count: intelligence.recommendationCount,
    summary: `marketplace-intelligence signals=${intelligence.signalCount} rankings=${intelligence.rankingCount} routings=${intelligence.routingCount} recommendations=${intelligence.recommendationCount} query=${query.valid} valid=${valid}`,
  };
}

export function executeMarketplaceIntelligenceQuery(
  query: MarketplaceIntelligenceQuery = {},
): MarketplaceIntelligenceQueryResult {
  let recommendations = buildMarketplaceRecommendations();
  let rankings = buildAllMarketplaceRankings(query.limit ?? 5);

  if (query.subjectId) {
    recommendations = recommendations.filter(
      (recommendation) => recommendation.subjectId === query.subjectId,
    );
  }

  if (query.marketplaceType) {
    recommendations = recommendations.filter(
      (recommendation) => recommendation.marketplaceType === query.marketplaceType,
    );
    rankings = rankings.filter((ranking) =>
      ranking.entries.some((entry) => entry.marketplaceType === query.marketplaceType),
    );
  }

  if (query.rankingDimension) {
    rankings = rankings.filter((ranking) => ranking.dimension === query.rankingDimension);
  }

  recommendations = recommendations
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, query.limit ?? recommendations.length);

  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.marketplaceType ?? "all-types",
    query.rankingDimension ?? "all-dimensions",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `marketplace-intelligence-query-${queryParts.join("-")}`,
    query,
    recommendations,
    rankings,
    hitCount: recommendations.length,
    intelligenceReady: recommendations.length > 0,
  };
}

export function validateMarketplaceIntelligenceQueryRegistry(): RegistryValidation {
  const canonical = executeMarketplaceIntelligenceQuery(CANONICAL_MARKETPLACE_INTELLIGENCE_QUERY);
  const top = recommendTopMarketplace(5);

  const valid =
    canonical.intelligenceReady &&
    canonical.hitCount >= 1 &&
    top.length >= 3 &&
    top[0]!.compositePriority >= TOP_MARKETPLACE_INTELLIGENCE_THRESHOLD - 10 &&
    canonical.recommendations.every(
      (recommendation) =>
        recommendation.opportunityPriority > 0 &&
        recommendation.matchingPriority > 0 &&
        recommendation.conversionPriority > 0 &&
        recommendation.retentionPriority > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `marketplace-intelligence-query canonical=${canonical.hitCount} top=${top.length} valid=${valid}`,
  };
}

export function validateIndustryMarketplaceIntelligence(): IndustryMarketplaceIntelligenceValidation {
  const signalRegistry = validateMarketplaceSignalRegistry();
  const rankingRegistry = validateMarketplaceRankingRegistry();
  const routingRegistry = validateMarketplaceRoutingRegistry();
  const recommendationRegistry = validateMarketplaceRecommendationRegistry();
  const intelligenceRegistry = validateMarketplaceIntelligenceRegistry();

  return {
    valid:
      signalRegistry.valid &&
      rankingRegistry.valid &&
      routingRegistry.valid &&
      recommendationRegistry.valid &&
      intelligenceRegistry.valid,
    signalRegistry,
    rankingRegistry,
    routingRegistry,
    recommendationRegistry,
    intelligenceRegistry,
  };
}
