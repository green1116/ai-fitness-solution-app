import type { GovernanceAnalysisResult, GovernancePrediction } from "./intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../federation-observability/observability-types";

export function predictGovernanceTrends(input: {
  deploymentId: string;
  observability: FederationObservabilityRuntimeResult;
  analysis: GovernanceAnalysisResult;
}): GovernancePrediction {
  const health = input.observability.health.healthScore;
  const stability = input.observability.governanceScore.stabilityScore;
  const recovery = input.observability.recovery.recoveryHealthScore;

  const trendMultiplier =
    input.analysis.trendDirection === "degrading" ? -8 : input.analysis.trendDirection === "improving" ? 5 : 0;

  const healthTrend = Math.max(0, Math.min(100, health + trendMultiplier));
  const stabilityTrend = Math.max(0, Math.min(100, stability + trendMultiplier * 0.8));
  const recoveryTrend = Math.max(0, Math.min(100, recovery + trendMultiplier * 0.6));

  const federationDegradationProbability = Math.max(
    0,
    Math.min(1, (100 - healthTrend) / 100 + (input.observability.topology.degradedRoutes > 0 ? 0.15 : 0)),
  );
  const consensusFailureProbability = Math.max(
    0,
    Math.min(1, 1 - input.observability.consensus.quorumReachRate + (input.observability.consensus.recoveryConsensusCount > 0 ? 0.2 : 0)),
  );

  return {
    predictionId: `governance-prediction-${input.deploymentId}`,
    healthTrend,
    stabilityTrend,
    recoveryTrend,
    federationDegradationProbability,
    consensusFailureProbability,
    horizon: "next-observation-cycle",
  };
}
