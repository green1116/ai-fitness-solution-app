import { PI_CANONICAL_ID } from "../shared/constants";
import { buildOptimizationOpportunityRegistry } from "./optimization-opportunity-registry";
import {
  mapOpportunityTypeToRecommendationType,
  type OptimizationRecommendationRecord,
  type OptimizationRecommendationRegistry,
} from "./optimization-types";
import type { OptimizationPriority } from "../shared/constants";

function resolveConfidence(priority: OptimizationPriority): number {
  if (priority === "high") return 88;
  if (priority === "medium") return 74;
  return 62;
}

let cachedRegistry: OptimizationRecommendationRegistry | undefined;

export function buildOptimizationRecommendationRegistry(): OptimizationRecommendationRegistry {
  if (cachedRegistry) return cachedRegistry;

  const opportunities = buildOptimizationOpportunityRegistry();
  const records: OptimizationRecommendationRecord[] = opportunities.records.map((opportunity) => {
    const confidence = resolveConfidence(opportunity.priority);

    return {
      recommendationId: `pi-recommendation-${opportunity.opportunityId}`,
      opportunityId: opportunity.opportunityId,
      recommendationType: mapOpportunityTypeToRecommendationType(opportunity.type),
      confidence,
      expectedScoreIncrease: Math.min(30, Math.max(5, opportunity.expectedImpact)),
    };
  });

  const averageConfidence =
    records.length === 0
      ? 0
      : Math.round(records.reduce((sum, record) => sum + record.confidence, 0) / records.length);

  cachedRegistry = {
    registryId: "pi-optimization-recommendation-registry-v46-p3",
    records,
    count: records.length,
    averageConfidence,
    mode: PI_CANONICAL_ID,
  };

  return cachedRegistry;
}
