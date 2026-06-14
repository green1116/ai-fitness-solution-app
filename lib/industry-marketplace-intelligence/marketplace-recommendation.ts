import type { IndustryMarketplace, IndustryMarketplaceType } from "@/lib/industry-marketplace";
import { buildIndustryMarketplace } from "@/lib/industry-marketplace";
import {
  buildConversionRanking,
  buildMatchingRanking,
  buildOpportunityRanking,
  buildRetentionRanking,
} from "./marketplace-ranking";
import type {
  MarketplacePriorityTier,
  MarketplaceRecommendation,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID } from "./shared/types";

function resolvePriorityTier(compositePriority: number): MarketplacePriorityTier {
  if (compositePriority >= 82) {
    return "high";
  }

  if (compositePriority >= 75) {
    return "medium";
  }

  return "low";
}

function buildRecommendationForRecord(record: IndustryMarketplace): MarketplaceRecommendation {
  const opportunity = buildOpportunityRanking(record.marketplaceType, 10);
  const matching = buildMatchingRanking(record.marketplaceType, 10);
  const conversion = buildConversionRanking(record.marketplaceType, 10);
  const retention = buildRetentionRanking(record.marketplaceType, 10);

  const findScore = (ranking: ReturnType<typeof buildOpportunityRanking>) =>
    ranking.entries.find((entry) => entry.marketplaceId === record.marketplaceId)?.priorityScore ??
    0;

  const opportunityPriority = findScore(opportunity);
  const matchingPriority = findScore(matching);
  const conversionPriority = findScore(conversion);
  const retentionPriority = findScore(retention);
  const compositePriority = Math.round(
    opportunityPriority * 0.3 +
      matchingPriority * 0.25 +
      conversionPriority * 0.25 +
      retentionPriority * 0.2,
  );

  return {
    recommendationId: `marketplace-recommendation-${record.marketplaceId}`,
    marketplaceId: record.marketplaceId,
    marketplaceType: record.marketplaceType,
    subjectId: record.subjectId,
    priorityTier: resolvePriorityTier(compositePriority),
    opportunityPriority,
    matchingPriority,
    conversionPriority,
    retentionPriority,
    compositePriority,
    reasons: [
      `Opportunity priority ${opportunityPriority}`,
      `Matching priority ${matchingPriority}`,
      `Conversion priority ${conversionPriority}`,
      `Retention priority ${retentionPriority}`,
    ],
    mode: "industry-marketplace-intelligence",
  };
}

export function buildMarketplaceRecommendations(): MarketplaceRecommendation[] {
  return buildIndustryMarketplace().map(buildRecommendationForRecord);
}

export function recommendSupplierMarketplace(limit = 5): MarketplaceRecommendation[] {
  return buildMarketplaceRecommendations()
    .filter((recommendation) => recommendation.marketplaceType === "supplier")
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, limit);
}

export function recommendBrandMarketplace(limit = 5): MarketplaceRecommendation[] {
  return buildMarketplaceRecommendations()
    .filter((recommendation) => recommendation.marketplaceType === "brand")
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, limit);
}

export function recommendTenderMarketplace(limit = 5): MarketplaceRecommendation[] {
  return buildMarketplaceRecommendations()
    .filter((recommendation) => recommendation.marketplaceType === "tender")
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, limit);
}

export function recommendPartnershipMarketplace(limit = 5): MarketplaceRecommendation[] {
  return buildMarketplaceRecommendations()
    .filter((recommendation) => recommendation.marketplaceType === "partnership")
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, limit);
}

export function recommendTopMarketplace(limit = 5): MarketplaceRecommendation[] {
  return buildMarketplaceRecommendations()
    .sort((left, right) => right.compositePriority - left.compositePriority)
    .slice(0, limit);
}

export function validateMarketplaceRecommendationRegistry(): RegistryValidation {
  const recommendations = buildMarketplaceRecommendations();
  const suppliers = recommendSupplierMarketplace(3);
  const brands = recommendBrandMarketplace(3);
  const tenders = recommendTenderMarketplace(3);
  const partnerships = recommendPartnershipMarketplace(3);
  const top = recommendTopMarketplace(5);

  const requiredTypes: IndustryMarketplaceType[] = ["supplier", "brand", "tender", "partnership"];

  const typeCoverage = requiredTypes.every((type) =>
    recommendations.some((recommendation) => recommendation.marketplaceType === type),
  );

  const tierCoverage = ["high", "medium", "low"].every((tier) =>
    recommendations.some((recommendation) => recommendation.priorityTier === tier),
  );

  const recommendationValid = recommendations.every(
    (recommendation) =>
      recommendation.opportunityPriority > 0 &&
      recommendation.matchingPriority > 0 &&
      recommendation.conversionPriority > 0 &&
      recommendation.retentionPriority > 0 &&
      recommendation.compositePriority > 0 &&
      recommendation.reasons.length >= 4,
  );

  const canonical = recommendations.filter(
    (recommendation) => recommendation.subjectId === CANONICAL_MARKETPLACE_INTELLIGENCE_SUBJECT_ID,
  );

  const monotonic =
    top.length >= 3 &&
    top.every(
      (entry, index, entries) =>
        index === 0 || entries[index - 1]!.compositePriority >= entry.compositePriority,
    );

  const valid =
    recommendations.length >= 8 &&
    typeCoverage &&
    tierCoverage &&
    recommendationValid &&
    canonical.length >= 1 &&
    suppliers.length >= 1 &&
    brands.length >= 1 &&
    tenders.length >= 1 &&
    partnerships.length >= 1 &&
    monotonic;

  return {
    valid,
    count: recommendations.length,
    summary: `marketplace-recommendation count=${recommendations.length} types=4/4 tiers=3/3 top=${top.length} valid=${valid}`,
  };
}
