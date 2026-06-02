import type { GovernancePrediction, GovernanceRiskIntelligence } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function buildGovernanceRiskIntelligence(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  prediction: GovernancePrediction;
  recommendationCount: number;
}): GovernanceRiskIntelligence {
  const currentRisk = input.observability.risk.overallRisk;
  const projectedRisk =
    input.prediction.federationDegradationProbability > 0.6 ||
    input.prediction.consensusFailureProbability > 0.6
      ? "critical"
      : input.prediction.federationDegradationProbability > 0.4
        ? "high"
        : currentRisk;

  const mitigationImpact = Math.min(
    40,
    input.recommendationCount * 6 + (input.observability.governanceScore.resilienceScore > 70 ? 10 : 0),
  );

  const confidenceScore = Math.max(
    0,
    Math.min(
      100,
      input.observability.governanceScore.confidenceScore -
        input.prediction.consensusFailureProbability * 20 +
        mitigationImpact * 0.5,
    ),
  );

  return {
    intelligenceId: `governance-risk-intelligence-${input.deploymentId}`,
    currentRisk,
    projectedRisk,
    mitigationImpact,
    confidenceScore: Math.round(confidenceScore),
  };
}
