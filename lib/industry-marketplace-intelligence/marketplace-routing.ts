import type { IndustryMarketplaceType } from "@/lib/industry-marketplace";
import {
  buildConversionRanking,
  buildMatchingRanking,
  buildOpportunityRanking,
  buildRetentionRanking,
} from "./marketplace-ranking";
import type { MarketplaceRouting, MarketplaceRoutingLane, RegistryValidation } from "./shared/types";

const ROUTING_LANE_BY_TYPE: Record<IndustryMarketplaceType, MarketplaceRoutingLane> = {
  supplier: "matching",
  brand: "opportunity",
  tender: "conversion",
  partnership: "retention",
};

function rankingForLane(marketplaceType: IndustryMarketplaceType, limit: number) {
  const lane = ROUTING_LANE_BY_TYPE[marketplaceType];

  switch (lane) {
    case "matching":
      return buildMatchingRanking(marketplaceType, limit);
    case "opportunity":
      return buildOpportunityRanking(marketplaceType, limit);
    case "conversion":
      return buildConversionRanking(marketplaceType, limit);
    case "retention":
      return buildRetentionRanking(marketplaceType, limit);
  }
}

function buildRoutingForType(marketplaceType: IndustryMarketplaceType): MarketplaceRouting {
  const ranking = rankingForLane(marketplaceType, 1);
  const topEntry = ranking.entries[0]!;
  const lane = ROUTING_LANE_BY_TYPE[marketplaceType];

  return {
    routingId: `marketplace-routing-${marketplaceType}-${lane}`,
    marketplaceType,
    targetMarketplaceId: topEntry.marketplaceId,
    subjectId: topEntry.subjectId,
    routingPriority: topEntry.priorityScore,
    routingLane: lane,
    reason: `Top ${marketplaceType} routed via ${lane} priority lane`,
    mode: "industry-marketplace-intelligence",
  };
}

export function buildMarketplaceRouting(): MarketplaceRouting[] {
  const types: IndustryMarketplaceType[] = ["supplier", "brand", "tender", "partnership"];

  return types.map(buildRoutingForType);
}

export function getMarketplaceRoutingByType(
  marketplaceType: IndustryMarketplaceType,
): MarketplaceRouting | undefined {
  return buildMarketplaceRouting().find((routing) => routing.marketplaceType === marketplaceType);
}

export function validateMarketplaceRoutingRegistry(): RegistryValidation {
  const routings = buildMarketplaceRouting();
  const requiredTypes: IndustryMarketplaceType[] = ["supplier", "brand", "tender", "partnership"];
  const requiredLanes: MarketplaceRoutingLane[] = [
    "opportunity",
    "matching",
    "conversion",
    "retention",
  ];

  const typeCoverage = requiredTypes.every((type) =>
    routings.some((routing) => routing.marketplaceType === type),
  );

  const laneCoverage = requiredLanes.every((lane) =>
    routings.some((routing) => routing.routingLane === lane),
  );

  const routingValid = routings.every(
    (routing) =>
      routing.targetMarketplaceId.length > 0 &&
      routing.routingPriority > 0 &&
      routing.reason.length > 0,
  );

  const valid = routings.length === 4 && typeCoverage && laneCoverage && routingValid;

  return {
    valid,
    count: routings.length,
    summary: `marketplace-routing count=${routings.length} types=4/4 lanes=4/4 valid=${valid}`,
  };
}
