import type { GovernanceIntelligenceScore } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function computeGovernanceIntelligenceScore(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  anomalyCount: number;
  recommendationCount: number;
  predictionConfidence: number;
}): GovernanceIntelligenceScore {
  const observabilityScore = input.observability.governanceScore.compositeScore;
  const predictabilityScore = Math.max(
    0,
    Math.min(100, 100 - input.anomalyCount * 12 - input.observability.consensus.convergenceLatencyMs / 10),
  );
  const resilienceScore = input.observability.governanceScore.resilienceScore;
  const recommendationScore = Math.min(100, 50 + input.recommendationCount * 8);
  const governanceConfidence = Math.round(
    (observabilityScore + predictabilityScore + resilienceScore + recommendationScore + input.predictionConfidence) / 5,
  );
  const compositeScore = Math.round(
    (observabilityScore + predictabilityScore + resilienceScore + recommendationScore + governanceConfidence) / 5,
  );

  return {
    scoreId: `governance-intelligence-score-${input.deploymentId}`,
    observabilityScore,
    predictabilityScore,
    resilienceScore,
    recommendationScore,
    governanceConfidence,
    compositeScore,
  };
}
