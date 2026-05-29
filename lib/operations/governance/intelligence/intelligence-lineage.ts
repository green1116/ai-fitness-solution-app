import type {
  GovernanceAnalysisResult,
  GovernanceAnomaly,
  GovernanceIntelligenceLineageGraph,
  GovernanceIntelligenceScore,
  GovernancePrediction,
  GovernanceRecommendation,
  GovernanceRiskIntelligence,
  GovernanceSignalBundle,
  GovernanceSimulation,
} from "./intelligence-types";

export function buildGovernanceIntelligenceLineageGraph(input: {
  deploymentId: string;
  signals: GovernanceSignalBundle;
  analysis: GovernanceAnalysisResult;
  anomalies: GovernanceAnomaly[];
  prediction: GovernancePrediction;
  recommendations: GovernanceRecommendation[];
  simulations: GovernanceSimulation[];
  riskIntelligence: GovernanceRiskIntelligence;
  intelligenceScore: GovernanceIntelligenceScore;
}): GovernanceIntelligenceLineageGraph {
  const now = new Date().toISOString();
  return {
    graphId: `governance-intelligence-lineage-${input.deploymentId}`,
    entries: [
      {
        entryId: `lineage-signals-${input.signals.bundleId}`,
        event: "signals",
        detail: `count=${input.signals.signals.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-analysis-${input.analysis.analysisId}`,
        event: "analysis",
        detail: input.analysis.summary,
        timestamp: now,
      },
      {
        entryId: `lineage-anomaly-${input.deploymentId}`,
        event: "anomaly",
        detail: `detected=${input.anomalies.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-prediction-${input.prediction.predictionId}`,
        event: "prediction",
        detail: `healthTrend=${input.prediction.healthTrend.toFixed(0)} degradation=${input.prediction.federationDegradationProbability.toFixed(2)}`,
        timestamp: now,
      },
      {
        entryId: `lineage-recommendation-${input.deploymentId}`,
        event: "recommendation",
        detail: `count=${input.recommendations.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-simulation-${input.deploymentId}`,
        event: "simulation",
        detail: `scenarios=${input.simulations.length}`,
        timestamp: now,
      },
      {
        entryId: `lineage-risk-${input.riskIntelligence.intelligenceId}`,
        event: "risk",
        detail: `current=${input.riskIntelligence.currentRisk} projected=${input.riskIntelligence.projectedRisk}`,
        timestamp: now,
      },
      {
        entryId: `lineage-score-${input.intelligenceScore.scoreId}`,
        event: "score",
        detail: `composite=${input.intelligenceScore.compositeScore} confidence=${input.intelligenceScore.governanceConfidence}`,
        timestamp: now,
      },
    ],
  };
}
