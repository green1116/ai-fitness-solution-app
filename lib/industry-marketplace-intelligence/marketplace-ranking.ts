import type { IndustryMarketplace, IndustryMarketplaceType } from "@/lib/industry-marketplace";
import { buildIndustryMarketplace } from "@/lib/industry-marketplace";
import type {
  MarketplaceRanking,
  MarketplaceRankingDimension,
  MarketplaceRankingEntry,
  RegistryValidation,
} from "./shared/types";

function computePriorityScore(
  record: IndustryMarketplace,
  dimension: MarketplaceRankingDimension,
): number {
  switch (dimension) {
    case "opportunity":
      return Math.round(
        record.score.totalMarketplaceScore * 0.5 +
          record.score.transactionScore * 0.3 +
          record.score.matchingScore * 0.2,
      );
    case "matching":
      return Math.round(record.score.matchingScore * 0.6 + record.score.visibilityScore * 0.4);
    case "conversion":
      return Math.round(
        record.score.transactionScore * 0.5 +
          record.score.visibilityScore * 0.3 +
          record.score.confidenceScore * 0.2,
      );
    case "retention":
      return Math.round(record.score.retentionScore * 0.7 + record.score.confidenceScore * 0.3);
  }
}

function rankRecords(
  records: IndustryMarketplace[],
  dimension: MarketplaceRankingDimension,
  marketplaceType?: IndustryMarketplaceType,
  limit = 5,
): MarketplaceRanking {
  const filtered = marketplaceType
    ? records.filter((record) => record.marketplaceType === marketplaceType)
    : records;

  const entries: MarketplaceRankingEntry[] = [...filtered]
    .map((record) => ({
      marketplaceId: record.marketplaceId,
      marketplaceType: record.marketplaceType,
      subjectId: record.subjectId,
      rank: 0,
      priorityScore: computePriorityScore(record, dimension),
    }))
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, limit)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const typeSuffix = marketplaceType ?? "all-types";

  return {
    rankingId: `marketplace-ranking-${dimension}-${typeSuffix}-${limit}`,
    dimension,
    marketplaceType,
    entries,
    rankingReady: entries.length > 0,
    mode: "industry-marketplace-intelligence",
  };
}

export function buildOpportunityRanking(
  marketplaceType?: IndustryMarketplaceType,
  limit = 5,
): MarketplaceRanking {
  return rankRecords(buildIndustryMarketplace(), "opportunity", marketplaceType, limit);
}

export function buildMatchingRanking(
  marketplaceType?: IndustryMarketplaceType,
  limit = 5,
): MarketplaceRanking {
  return rankRecords(buildIndustryMarketplace(), "matching", marketplaceType, limit);
}

export function buildConversionRanking(
  marketplaceType?: IndustryMarketplaceType,
  limit = 5,
): MarketplaceRanking {
  return rankRecords(buildIndustryMarketplace(), "conversion", marketplaceType, limit);
}

export function buildRetentionRanking(
  marketplaceType?: IndustryMarketplaceType,
  limit = 5,
): MarketplaceRanking {
  return rankRecords(buildIndustryMarketplace(), "retention", marketplaceType, limit);
}

export function rankSupplierMarketplacePriority(limit = 5): MarketplaceRanking {
  return buildOpportunityRanking("supplier", limit);
}

export function rankBrandMarketplacePriority(limit = 5): MarketplaceRanking {
  return buildOpportunityRanking("brand", limit);
}

export function rankTenderMarketplacePriority(limit = 5): MarketplaceRanking {
  return buildOpportunityRanking("tender", limit);
}

export function rankPartnershipMarketplacePriority(limit = 5): MarketplaceRanking {
  return buildOpportunityRanking("partnership", limit);
}

export function buildAllMarketplaceRankings(limit = 5): MarketplaceRanking[] {
  const dimensions: MarketplaceRankingDimension[] = [
    "opportunity",
    "matching",
    "conversion",
    "retention",
  ];

  return dimensions.flatMap((dimension) =>
    rankRecords(buildIndustryMarketplace(), dimension, undefined, limit),
  );
}

export function validateMarketplaceRankingRegistry(): RegistryValidation {
  const rankings = buildAllMarketplaceRankings(5);
  const supplierRanking = rankSupplierMarketplacePriority(3);
  const brandRanking = rankBrandMarketplacePriority(3);
  const tenderRanking = rankTenderMarketplacePriority(3);
  const partnershipRanking = rankPartnershipMarketplacePriority(3);

  const dimensions = ["opportunity", "matching", "conversion", "retention"] as const;
  const dimensionCoverage = dimensions.every((dimension) =>
    rankings.some((ranking) => ranking.dimension === dimension && ranking.rankingReady),
  );

  const monotonic =
    supplierRanking.rankingReady &&
    supplierRanking.entries.every(
      (entry, index, entries) =>
        index === 0 || entries[index - 1]!.priorityScore >= entry.priorityScore,
    );

  const valid =
    dimensionCoverage &&
    monotonic &&
    supplierRanking.entries.length >= 1 &&
    brandRanking.entries.length >= 1 &&
    tenderRanking.entries.length >= 1 &&
    partnershipRanking.entries.length >= 1;

  return {
    valid,
    count: rankings.length,
    summary: `marketplace-ranking dimensions=4/4 suppliers=${supplierRanking.entries.length} tenders=${tenderRanking.entries.length} valid=${valid}`,
  };
}
